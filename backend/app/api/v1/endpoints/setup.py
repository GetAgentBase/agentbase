from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....models import User, APIKey
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
    
    # Return success response
    return SetupResponse(
        message="Setup successful. You can now log in as an administrator.",
        user_id=str(new_user.id)
    ) 