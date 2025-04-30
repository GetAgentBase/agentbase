from pydantic import BaseModel, EmailStr, Field, validator
import re

class SetupRequest(BaseModel):
    """
    Schema for the initial setup request.
    
    Contains the administrator's email, password, and the first API key.
    """
    email: EmailStr = Field(..., description="Admin user email address")
    password: str = Field(..., description="Admin user password", min_length=8)
    api_key_provider: str = Field(..., description="API key provider name (e.g., 'OpenAI', 'Anthropic')")
    api_key_value: str = Field(..., description="Actual API key value")
    
    @validator('password')
    def password_strength(cls, v):
        """Validate that the password meets basic complexity requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        # Check for at least one uppercase, one lowercase, and one digit
        if not (re.search(r'[A-Z]', v) and re.search(r'[a-z]', v) and re.search(r'[0-9]', v)):
            raise ValueError("Password must contain at least one uppercase letter, one lowercase letter, and one digit")
            
        return v
    
    @validator('api_key_value')
    def api_key_not_empty(cls, v):
        """Validate that the API key is not empty."""
        if not v.strip():
            raise ValueError("API key cannot be empty")
        return v


class SetupResponse(BaseModel):
    """
    Schema for the setup response.
    """
    message: str
    user_id: str 