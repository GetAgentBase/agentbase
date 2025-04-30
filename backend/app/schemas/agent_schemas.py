from pydantic import BaseModel, Field, UUID4
from typing import Optional, List
from datetime import datetime

# Request models
class AgentCreate(BaseModel):
    """Schema for creating a new agent."""
    name: str = Field(..., description="Name of the agent", min_length=1, max_length=100)
    description: Optional[str] = Field(None, description="Optional description of the agent's purpose")
    system_prompt: Optional[str] = Field(None, description="Optional system prompt to guide the agent's behavior")
    llm_config_id: Optional[UUID4] = Field(None, description="ID of the LLM configuration to use (or None for default)")

class AgentUpdate(BaseModel):
    """Schema for updating an existing agent."""
    name: Optional[str] = Field(None, description="Name of the agent", min_length=1, max_length=100)
    description: Optional[str] = Field(None, description="Description of the agent's purpose")
    system_prompt: Optional[str] = Field(None, description="System prompt to guide the agent's behavior")
    llm_config_id: Optional[UUID4] = Field(None, description="ID of the LLM configuration to use")

# Response models
class AgentResponse(BaseModel):
    """Schema for agent information returned to clients."""
    id: UUID4
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    llm_config_id: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config for the Agent model."""
        from_attributes = True

class AgentListResponse(BaseModel):
    """Schema for a list of agents."""
    agents: List[AgentResponse]
    count: int 