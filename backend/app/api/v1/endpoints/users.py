from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from ....models import User, APIKey, LLMConfig, Agent
from ....db.session import get_db
from sqlalchemy.orm import Session
from ...dependencies import get_current_active_user, get_current_superuser
from ....security import decrypt_data, encrypt_data
from ....schemas import LLMConfigListResponse, LLMConfigResponse
from ....services.llm_config_service import get_llm_configs_by_user

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


class APIKeyResponse(BaseModel):
    """Schema for API key information returned to clients."""
    id: UUID
    provider_name: str
    masked_key: str
    created_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config for the APIKey model."""
        from_attributes = True


class ApiKeyCreate(BaseModel):
    """Schema for creating a new API key."""
    provider_name: str = Field(..., description="Name of the API provider (e.g., 'OpenAI', 'Anthropic')")
    api_key: str = Field(..., description="The API key to store")


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


@router.get("/users/me/api-keys", response_model=List[APIKeyResponse])
async def get_api_keys(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get the API keys for the currently authenticated user.
    
    Args:
        current_user: Current authenticated user from the token dependency
        db: Database session
        
    Returns:
        List of the user's API keys with masked values
    """
    # Query API keys for the current user
    api_keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).all()
    
    # Prepare the response with masked keys
    result = []
    for key in api_keys:
        # Decrypt the key
        decrypted_key = decrypt_data(key.encrypted_key)
        
        # Create a masked version (show first 4 and last 4 characters)
        masked_key = "••••••••"
        if decrypted_key:
            if len(decrypted_key) > 8:
                masked_key = f"{decrypted_key[:4]}{'•' * (len(decrypted_key) - 8)}{decrypted_key[-4:]}"
            else:
                masked_key = decrypted_key  # For very short keys, just show them
        
        # Create response object with all fields from the model plus the masked key
        response_key = APIKeyResponse(
            id=key.id,
            provider_name=key.provider_name,
            masked_key=masked_key,
            created_at=key.created_at
        )
        result.append(response_key)
    
    return result 


@router.get("/users/me/llm-configs", response_model=List[LLMConfigResponse])
async def get_user_llm_configs(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a list of LLM configurations for the current user.
    
    Returns:
        List of LLM configurations
    """
    configs = get_llm_configs_by_user(db, current_user.id)
    return configs 


@router.post("/users/me/api-keys", response_model=APIKeyResponse, status_code=201)
async def create_api_key(
    api_key_data: ApiKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new API key for the current user and set up default LLM configurations.
    
    Args:
        api_key_data: The API key data to store
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        The created API key (with masked value)
    """
    # Encrypt the API key
    encrypted_key = encrypt_data(api_key_data.api_key)
    
    # Create the API key
    new_api_key = APIKey(
        user_id=current_user.id,
        provider_name=api_key_data.provider_name,
        encrypted_key=encrypted_key
    )
    
    # Add to database
    db.add(new_api_key)
    db.commit()
    db.refresh(new_api_key)
    
    # Create default LLM configurations based on the provider
    if api_key_data.provider_name.lower() == "openai":
        # Add GPT-4o configuration (default)
        gpt4o_config = LLMConfig(
            user_id=current_user.id,
            provider="openai",
            model_name="gpt-4o",
            encrypted_credentials=encrypted_key,
            is_default=True
        )
        db.add(gpt4o_config)
        
        # Add GPT-3.5 Turbo configuration
        gpt35_config = LLMConfig(
            user_id=current_user.id,
            provider="openai",
            model_name="gpt-3.5-turbo",
            encrypted_credentials=encrypted_key,
            is_default=False
        )
        db.add(gpt35_config)
        
    elif api_key_data.provider_name.lower() == "anthropic":
        # Add Claude 3 Opus configuration (default)
        claude_opus_config = LLMConfig(
            user_id=current_user.id,
            provider="anthropic",
            model_name="claude-3-opus-20240229",
            encrypted_credentials=encrypted_key,
            is_default=True
        )
        db.add(claude_opus_config)
        
        # Add Claude 3 Sonnet configuration
        claude_sonnet_config = LLMConfig(
            user_id=current_user.id,
            provider="anthropic",
            model_name="claude-3-sonnet-20240229",
            encrypted_credentials=encrypted_key,
            is_default=False
        )
        db.add(claude_sonnet_config)
        
        # Add Claude 3 Haiku configuration
        claude_haiku_config = LLMConfig(
            user_id=current_user.id,
            provider="anthropic",
            model_name="claude-3-haiku-20240307",
            encrypted_credentials=encrypted_key,
            is_default=False
        )
        db.add(claude_haiku_config)
    
    db.commit()
    
    # Return masked version for security
    decrypted_key = api_key_data.api_key
    masked_key = "••••••••"
    if len(decrypted_key) > 8:
        masked_key = f"{decrypted_key[:4]}{'•' * (len(decrypted_key) - 8)}{decrypted_key[-4:]}"
    else:
        masked_key = decrypted_key
    
    return APIKeyResponse(
        id=new_api_key.id,
        provider_name=new_api_key.provider_name,
        masked_key=masked_key,
        created_at=new_api_key.created_at
    ) 


@router.delete("/users/me/api-keys/{api_key_id}", status_code=204)
async def delete_api_key(
    api_key_id: UUID = Path(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an API key and its associated LLM configurations.
    
    Args:
        api_key_id: ID of the API key to delete
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        204 No Content if successful
        
    Raises:
        HTTPException: If the API key doesn't exist or isn't owned by the user
    """
    # Find the API key
    api_key = db.query(APIKey).filter(
        APIKey.id == api_key_id,
        APIKey.user_id == current_user.id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=404,
            detail="API key not found or you don't have permission to delete it"
        )
    
    # Find LLM configurations using this API key
    llm_configs = db.query(LLMConfig).filter(
        LLMConfig.user_id == current_user.id,
        LLMConfig.encrypted_credentials == api_key.encrypted_key
    ).all()
    
    # Check if any of these LLM configs are used by agents
    affected_agents = []
    for llm_config in llm_configs:
        # Find agents using this LLM config
        agents = db.query(Agent).filter(
            Agent.llm_config_id == llm_config.id
        ).all()
        
        # Update these agents to have no LLM config
        for agent in agents:
            agent.llm_config_id = None
            affected_agents.append(agent.id)
    
    # Delete LLM configurations
    for llm_config in llm_configs:
        db.delete(llm_config)
    
    # Delete the API key
    db.delete(api_key)
    
    # Commit changes
    db.commit()
    
    return None 