from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ....db.session import get_db
from ....models import User, ConversationTurn
from ....schemas.chat_schemas import (
    ChatMessageRequest, ChatMessageResponse, ChatHistoryResponse
)
from ....services.chat_service import get_chat_service
from ...dependencies import get_current_active_user

router = APIRouter()


@router.post("/agents/{agent_id}/chat", response_model=ChatMessageResponse)
async def send_chat_message(
    agent_id: UUID = Path(..., description="ID of the agent to chat with"),
    message: ChatMessageRequest = ...,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to an agent and get a response.
    
    Args:
        agent_id: ID of the agent to chat with
        message: Message to send
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Agent's response
        
    Raises:
        HTTPException: If agent not found or message processing fails
    """
    chat_service = get_chat_service(db)
    return await chat_service.send_message(agent_id, current_user.id, message.content)


@router.get("/agents/{agent_id}/chat", response_model=ChatHistoryResponse)
async def get_chat_history(
    agent_id: UUID = Path(..., description="ID of the agent"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of messages to return"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get chat history for an agent.
    
    Args:
        agent_id: ID of the agent
        limit: Maximum number of messages to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Chat history
        
    Raises:
        HTTPException: If agent not found
    """
    chat_service = get_chat_service(db)
    
    # Verify agent belongs to user
    chat_service.get_agent_with_config(agent_id, current_user.id)
    
    # Get history
    messages = chat_service.get_conversation_history(agent_id, limit)
    
    return ChatHistoryResponse(
        messages=messages,
        count=len(messages)
    )


@router.delete("/agents/{agent_id}/chat", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_history(
    agent_id: UUID = Path(..., description="ID of the agent"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Clear chat history for an agent.
    
    Args:
        agent_id: ID of the agent
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If agent not found
    """
    chat_service = get_chat_service(db)
    
    # Verify agent belongs to user
    chat_service.get_agent_with_config(agent_id, current_user.id)
    
    # Delete all conversation turns for this agent
    db.query(ConversationTurn).filter(
        ConversationTurn.agent_id == agent_id
    ).delete()
    
    db.commit() 