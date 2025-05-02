"""
Connector Setup Endpoints

API endpoints for connector setup walkthroughs.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel

from ....api.dependencies import get_current_user
from ....models import User
from ....connector_walkthroughs import get_walkthrough, list_available_walkthroughs

router = APIRouter(prefix="/connector-setup")


class WalkthroughList(BaseModel):
    """Response model for listing available walkthroughs."""
    walkthroughs: Dict[str, str]


class ConnectorWalkthrough(BaseModel):
    """Response model for connector walkthrough."""
    name: str
    auth_type: str
    steps: list
    troubleshooting: list


@router.get("/", response_model=WalkthroughList)
async def list_walkthroughs(
    current_user: User = Depends(get_current_user)
):
    """
    List all available connector setup walkthroughs.
    
    Returns:
        Dictionary of connector names to authentication types
    """
    return {
        "walkthroughs": list_available_walkthroughs()
    }


@router.get("/{connector_name}", response_model=ConnectorWalkthrough)
async def get_connector_walkthrough(
    connector_name: str = Path(..., description="Name of the connector"),
    current_user: User = Depends(get_current_user)
):
    """
    Get the setup walkthrough for a specific connector.
    
    Args:
        connector_name: Name of the connector
        
    Returns:
        Connector walkthrough with steps and troubleshooting
        
    Raises:
        HTTPException 404: If walkthrough not found
    """
    walkthrough = get_walkthrough(connector_name)
    if not walkthrough:
        raise HTTPException(status_code=404, detail=f"No walkthrough found for connector: {connector_name}")
    
    return walkthrough 