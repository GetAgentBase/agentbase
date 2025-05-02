from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum
from uuid import UUID


class ConnectorStatus(str, Enum):
    """Status of a connector implementation."""
    AVAILABLE = "available"
    COMING_SOON = "coming_soon"
    PLANNED = "planned"


class ConnectorType(str, Enum):
    """Type of connector based on authentication method."""
    BUILTIN = "builtin"  # No auth needed, built into system
    API_KEY = "api_key"  # Requires API key
    OAUTH2 = "oauth2"    # Requires OAuth2 flow
    CUSTOM = "custom"    # Custom auth mechanism


class SetupStatus(str, Enum):
    """Setup status for a user's connector."""
    NEEDS_SETUP = "needs_setup"  # Initial configuration needed
    ACTIVE = "active"            # Fully configured and working
    ERROR = "error"              # Configuration error


class ConnectorBase(BaseModel):
    """Base model for connector data."""
    name: str = Field(..., description="User-friendly name of the connector")
    description: str = Field(..., description="Detailed description of what the connector does")
    tool_type: ConnectorType = Field(..., description="Type of connector based on auth method")
    config_schema: Optional[Dict[str, Any]] = Field(None, description="JSON Schema for configuration")
    status: ConnectorStatus = Field(..., description="Implementation status")


class ConnectorRead(ConnectorBase):
    """Model for reading connector data."""
    id: str = Field(..., description="Unique identifier for the connector")
    execution_ref: str = Field(..., description="Reference to implementation")


class ConnectorList(BaseModel):
    """Model for list of connectors response."""
    connectors: List[ConnectorRead] = Field(..., description="List of available connectors")
    count: int = Field(..., description="Total number of connectors")


class UserConnectorBase(BaseModel):
    """Base model for user connector data."""
    name: str = Field(..., description="User-defined name for this connector instance")
    tool_id: UUID = Field(..., description="ID of the connector type from catalog")
    config_data: Optional[Dict[str, Any]] = Field(None, description="User-specific configuration")


class UserConnectorCreate(UserConnectorBase):
    """Model for creating a new user connector."""
    pass


class UserConnectorUpdate(BaseModel):
    """Model for updating a user connector."""
    name: Optional[str] = Field(None, description="User-defined name for this connector instance")
    config_data: Optional[Dict[str, Any]] = Field(None, description="User-specific configuration")
    setup_status: Optional[SetupStatus] = Field(None, description="Setup status")


class UserConnectorRead(UserConnectorBase):
    """Model for reading a user connector."""
    id: UUID = Field(..., description="Unique identifier for this connector instance")
    user_id: UUID = Field(..., description="ID of the user who owns this connector")
    setup_status: SetupStatus = Field(..., description="Current setup status")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    
    # Include connector type information
    connector_type: Optional[ConnectorRead] = Field(None, description="Connector type details")


class UserConnectorList(BaseModel):
    """Model for list of user connectors response."""
    connectors: List[UserConnectorRead] = Field(..., description="List of user's configured connectors")
    count: int = Field(..., description="Total number of user's connectors") 