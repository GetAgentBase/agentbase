from pydantic import BaseModel, Field


class Token(BaseModel):
    """
    Schema for the JWT token response.
    
    Contains the access token and token type for OAuth2 compatibility.
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Token type (bearer)")


class TokenData(BaseModel):
    """
    Schema for token payload data.
    
    Contains user identification extracted from a JWT token.
    """
    user_id: str = Field(None, description="User ID from token subject claim")
    scopes: list[str] = Field(default_factory=list, description="Token permission scopes") 