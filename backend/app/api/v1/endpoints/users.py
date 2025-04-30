from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

from ....models import User
from ...dependencies import get_current_active_user, get_current_superuser

router = APIRouter()


class UserResponse(BaseModel):
    """Schema for user information returned to clients."""
    id: UUID
    email: str
    is_active: bool
    is_superuser: bool
    created_at: Optional[datetime] = None

    class Config:
        """Pydantic config for the User model."""
        from_attributes = True


@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get information about the currently authenticated user.
    
    Args:
        current_user: Current authenticated user from the token dependency
        
    Returns:
        The user's information
    """
    return current_user


@router.get("/users/me/admin", response_model=UserResponse)
async def read_users_me_admin(current_user: User = Depends(get_current_superuser)):
    """
    Get information about the currently authenticated superuser.
    Endpoint is only accessible to superusers.
    
    Args:
        current_user: Current authenticated superuser from the token dependency
        
    Returns:
        The superuser's information
    """
    return current_user 