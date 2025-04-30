from pydantic import BaseModel, Field, UUID4
from typing import Optional, List
from datetime import datetime

# Response model
class LLMConfigResponse(BaseModel):
    """Schema for LLM configuration information returned to clients."""
    id: UUID4
    provider: str
    model_name: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config for the LLMConfig model."""
        from_attributes = True

# List response model
class LLMConfigListResponse(BaseModel):
    """Schema for a list of LLM configurations."""
    configs: List[LLMConfigResponse]
    count: int 