from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from ..db.session import get_db
from ..models import User
from ..security.tokens import decode_access_token
from ..services.user_service import get_user_by_id

# OAuth2 scheme for token extraction from requests
# tokenUrl is the endpoint where clients can get a token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Standard exception for authentication failures
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from a JWT token.
    
    Args:
        token: JWT token extracted from the Authorization header
        db: Database session
        
    Returns:
        User: The authenticated user
        
    Raises:
        HTTPException: If token is invalid or user doesn't exist
    """
    try:
        # Decode the JWT token
        payload = decode_access_token(token)
        
        # Extract user ID from subject claim
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        # This is caught by decode_access_token, but we include it here for clarity
        raise credentials_exception
        
    # Get user from database
    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception
        
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get the current authenticated user and verify they are active.
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        User: The active authenticated user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
        
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Dependency to get the current authenticated user and verify they are a superuser.
    
    Args:
        current_user: User from get_current_active_user dependency
        
    Returns:
        User: The active authenticated superuser
        
    Raises:
        HTTPException: If user is not a superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
        
    return current_user 