from pydantic import BaseModel, Field, UUID4
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Enum for message roles in a chat."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


class ChatMessageRequest(BaseModel):
    """Schema for a chat message sent by a client."""
    content: str = Field(..., description="Content of the message")


class ToolCallRequest(BaseModel):
    """Schema for a tool call in a chat message."""
    tool_name: str
    input: Dict[str, Any]


class ToolCallResponse(BaseModel):
    """Schema for a tool call response."""
    tool_call_id: str
    tool_name: str
    output: Dict[str, Any]


class ChatMessageResponse(BaseModel):
    """Schema for a chat message returned to a client."""
    id: UUID4
    role: MessageRole
    content: Optional[str] = None
    tool_call_id: Optional[str] = None
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    """Schema for a chat history response."""
    messages: List[ChatMessageResponse]
    count: int 