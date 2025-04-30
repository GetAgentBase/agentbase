from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....models import User, APIKey, LLMConfig
from ....schemas.setup_schemas import SetupRequest, SetupResponse
from ....services.setup_service import is_setup_complete
from ....security import hash_password, encrypt_data

router = APIRouter()


@router.post("/setup", response_model=SetupResponse, status_code=201)
async def perform_setup(setup_data: SetupRequest, db: Session = Depends(get_db)):
    """
    Perform initial system setup.
    
    Creates the first superuser (admin) account and configures the first API key.
    This endpoint can only be called once when the system is first initialized.
    
    Args:
        setup_data: Admin account and API key details
        db: Database session
        
    Returns:
        Setup success message and user ID
        
    Raises:
        HTTPException 403: If setup has already been completed
    """
    # Check if setup has already been completed
    if is_setup_complete(db):
        raise HTTPException(
            status_code=403,
            detail="Setup already completed. Cannot create another superuser account."
        )
    
    # Hash the password
    hashed_password = hash_password(setup_data.password)
    
    # Encrypt the API key
    encrypted_api_key = encrypt_data(setup_data.api_key_value)
    
    # Create the superuser
    new_user = User(
        email=setup_data.email,
        hashed_password=hashed_password,
        is_superuser=True,
        is_active=True
    )
    
    # Add user to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create API key entry
    new_api_key = APIKey(
        user_id=new_user.id,
        provider_name=setup_data.api_key_provider,
        encrypted_key=encrypted_api_key
    )
    
    # Add API key to database
    db.add(new_api_key)
    db.commit()
    db.refresh(new_api_key)
    
    # Create default LLM configurations based on the provider
    if setup_data.api_key_provider.lower() == "openai":
        # Add GPT-4o configuration (default)
        gpt4o_config = LLMConfig(
            user_id=new_user.id,
            provider="openai",
            model_name="gpt-4o",
            encrypted_credentials=encrypted_api_key,
            is_default=True
        )
        db.add(gpt4o_config)
        
        # Add GPT-3.5 Turbo configuration
        gpt35_config = LLMConfig(
            user_id=new_user.id,
            provider="openai",
            model_name="gpt-3.5-turbo",
            encrypted_credentials=encrypted_api_key,
            is_default=False
        )
        db.add(gpt35_config)
        
    elif setup_data.api_key_provider.lower() == "anthropic":
        # Add Claude 3 Opus configuration (default)
        claude_opus_config = LLMConfig(
            user_id=new_user.id,
            provider="anthropic",
            model_name="claude-3-opus-20240229",
            encrypted_credentials=encrypted_api_key,
            is_default=True
        )
        db.add(claude_opus_config)
        
        # Add Claude 3 Sonnet configuration
        claude_sonnet_config = LLMConfig(
            user_id=new_user.id,
            provider="anthropic",
            model_name="claude-3-sonnet-20240229",
            encrypted_credentials=encrypted_api_key,
            is_default=False
        )
        db.add(claude_sonnet_config)
        
        # Add Claude 3 Haiku configuration
        claude_haiku_config = LLMConfig(
            user_id=new_user.id,
            provider="anthropic",
            model_name="claude-3-haiku-20240307",
            encrypted_credentials=encrypted_api_key,
            is_default=False
        )
        db.add(claude_haiku_config)
    
    db.commit()
    
    # Return success response
    return SetupResponse(
        message="Setup successful. You can now log in as an administrator.",
        user_id=str(new_user.id)
    ) 