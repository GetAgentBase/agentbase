from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.auth_schemas import Token
from ....services.user_service import get_user_by_email
from ....security import verify_password, create_access_token

router = APIRouter()


@router.post("/auth/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    
    Args:
        form_data: OAuth2 form with username (email) and password
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException 401: If authentication fails
    """
    # Get user by email (username field contains email)
    user = get_user_by_email(db, email=form_data.username)
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Create access token with user ID as subject
    access_token = create_access_token(
        data={"sub": str(user.id), "type": "access"}
    )
    
    # Return token in the expected format
    return Token(access_token=access_token, token_type="bearer") 