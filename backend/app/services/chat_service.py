import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import openai
import anthropic
import httpx
import json
import logging
from datetime import datetime
from ..models import Agent, ConversationTurn, LLMConfig
from ..schemas.chat_schemas import MessageRole
from ..security import decrypt_data

# Set up logging
logger = logging.getLogger(__name__)

class ChatService:
    """Service for handling chat with agents."""

    def __init__(self, db: Session):
        """Initialize the chat service."""
        self.db = db
        self.clients = {}  # Store API clients by provider
        
    def _get_openai_client(self, api_key: str) -> openai.OpenAI:
        """Get or create an OpenAI client."""
        if "openai" not in self.clients:
            self.clients["openai"] = openai.OpenAI(api_key=api_key)
        return self.clients["openai"]
    
    def _get_anthropic_client(self, api_key: str) -> anthropic.Anthropic:
        """Get or create an Anthropic client."""
        if "anthropic" not in self.clients:
            self.clients["anthropic"] = anthropic.Anthropic(api_key=api_key)
        return self.clients["anthropic"]
    
    def get_agent_with_config(self, agent_id: uuid.UUID, user_id: uuid.UUID) -> tuple[Agent, LLMConfig]:
        """Get an agent and its LLM configuration."""
        # Get the agent
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == user_id
        ).first()
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        
        # Get the LLM configuration
        llm_config = self.db.query(LLMConfig).filter(
            LLMConfig.id == agent.llm_config_id
        ).first()
        
        if not llm_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agent does not have a valid LLM configuration"
            )
        
        return agent, llm_config
    
    def get_conversation_history(self, agent_id: uuid.UUID, limit: int = 50) -> List[ConversationTurn]:
        """Get conversation history for an agent."""
        return self.db.query(ConversationTurn).filter(
            ConversationTurn.agent_id == agent_id
        ).order_by(ConversationTurn.timestamp.asc()).limit(limit).all()
    
    def save_message(self, agent_id: uuid.UUID, role: str, content: Optional[str] = None,
                     tool_call_id: Optional[str] = None, tool_name: Optional[str] = None,
                     tool_input: Optional[Dict[str, Any]] = None, 
                     tool_output: Optional[Dict[str, Any]] = None) -> ConversationTurn:
        """Save a message to the conversation history."""
        message = ConversationTurn(
            id=uuid.uuid4(),
            agent_id=agent_id,
            role=role,
            content=content,
            tool_call_id=tool_call_id,
            tool_name=tool_name,
            tool_input=tool_input,
            tool_output=tool_output
        )
        
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        return message
    
    def _prepare_messages_for_openai(self, agent: Agent, history: List[ConversationTurn]) -> List[Dict[str, Any]]:
        """Prepare messages for the OpenAI API."""
        messages = []
        
        # Add system prompt if available
        if agent.system_prompt:
            messages.append({
                "role": "system",
                "content": agent.system_prompt
            })
        
        # Add conversation history
        for turn in history:
            message = {"role": turn.role}
            
            if turn.content:
                message["content"] = turn.content
                
            # Handle tool calls/responses
            if turn.role == "tool" and turn.tool_call_id and turn.tool_output:
                message = {
                    "role": "tool",
                    "tool_call_id": turn.tool_call_id,
                    "content": json.dumps(turn.tool_output)
                }
            elif turn.role == "assistant" and turn.tool_name and turn.tool_input:
                message["tool_calls"] = [{
                    "id": turn.tool_call_id or str(uuid.uuid4()),
                    "type": "function",
                    "function": {
                        "name": turn.tool_name,
                        "arguments": json.dumps(turn.tool_input)
                    }
                }]
            
            messages.append(message)
            
        return messages
    
    def _prepare_messages_for_anthropic(self, agent: Agent, history: List[ConversationTurn]) -> List[Dict[str, Any]]:
        """Prepare messages for the Anthropic API."""
        messages = []
        
        # Add conversation history
        for turn in history:
            if turn.role == "user" and turn.content:
                messages.append({
                    "role": "user",
                    "content": turn.content
                })
            elif turn.role == "assistant" and turn.content:
                messages.append({
                    "role": "assistant",
                    "content": turn.content
                })
            # Tool calls are handled differently for Anthropic
            # This is a simplified implementation
        
        return messages, agent.system_prompt
    
    async def send_message(self, agent_id: uuid.UUID, user_id: uuid.UUID, content: str) -> ConversationTurn:
        """Send a message to an agent and get a response."""
        # Get agent and LLM config
        agent, llm_config = self.get_agent_with_config(agent_id, user_id)
        
        # Save user message
        user_message = self.save_message(
            agent_id=agent_id,
            role=MessageRole.USER.value,
            content=content
        )
        
        # Get conversation history
        history = self.get_conversation_history(agent_id)
        
        # Decrypt API key
        api_key = decrypt_data(llm_config.encrypted_credentials)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to decrypt API key"
            )
        
        try:
            response_content = None
            
            # Process based on provider
            if llm_config.provider.lower() == "openai":
                response_content = await self._process_openai_message(agent, llm_config, api_key, history)
            elif llm_config.provider.lower() == "anthropic":
                response_content = await self._process_anthropic_message(agent, llm_config, api_key, history)
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported LLM provider: {llm_config.provider}"
                )
            
            # Save assistant message
            assistant_message = self.save_message(
                agent_id=agent_id,
                role=MessageRole.ASSISTANT.value,
                content=response_content
            )
            
            return assistant_message
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing message: {str(e)}"
            )
    
    async def _process_openai_message(self, agent: Agent, llm_config: LLMConfig, api_key: str, 
                                     history: List[ConversationTurn]) -> str:
        """Process a message using the OpenAI API."""
        client = self._get_openai_client(api_key)
        messages = self._prepare_messages_for_openai(agent, history)
        
        response = client.chat.completions.create(
            model=llm_config.model_name,
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        
        return response.choices[0].message.content
    
    async def _process_anthropic_message(self, agent: Agent, llm_config: LLMConfig, api_key: str, 
                                        history: List[ConversationTurn]) -> str:
        """Process a message using the Anthropic API."""
        client = self._get_anthropic_client(api_key)
        messages, system = self._prepare_messages_for_anthropic(agent, history)
        
        response = client.messages.create(
            model=llm_config.model_name,
            messages=messages,
            system=system,
            max_tokens=1000,
        )
        
        return response.content[0].text
        
def get_chat_service(db: Session) -> ChatService:
    """Get a chat service instance."""
    return ChatService(db) 