from jose import jwt, JWTError
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import os
import logging
from typing import Optional, Dict, Any, Union

logger = logging.getLogger(__name__)

# Configuration from environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    logger.warning("SECRET_KEY not set in environment variables. Using insecure default key!")
    SECRET_KEY = "insecure_temporary_key_replace_in_production"

# JWT encoding algorithm
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Token expiration time (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


class TokenError(Exception):
    """Base exception for token-related errors."""
    pass


def create_access_token(
    data: Dict[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a new JWT access token.
    
    Args:
        data: Data to encode in the token (typically includes user ID)
        expires_delta: Custom expiration time, or None to use default
        
    Returns:
        JWT token as a string
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiration claim to payload
    to_encode.update({"exp": expire})
    
    # Encode and return the JWT
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: JWT token to decode
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Decode the JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_token_data(token: str, token_type: str = "access") -> Dict[str, Any]:
    """
    Get and validate data from a token.
    
    Args:
        token: JWT token
        token_type: Type of token (access or refresh)
        
    Returns:
        Token data including user information
        
    Raises:
        HTTPException: If token is invalid or does not contain required fields
    """
    payload = decode_access_token(token)
    
    # Check for required fields
    if not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check token type if specified
    if token_type and payload.get("type") != token_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token type. Expected {token_type} token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload 