from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
import uuid

from ....api.dependencies import get_db, get_current_user
from ....services.connector_catalog import get_connector_registry
from ....services.user_connector_service import (
    create_user_connector,
    get_user_connectors,
    get_user_connector,
    update_user_connector,
    delete_user_connector,
    link_connector_to_agent,
    unlink_connector_from_agent,
    get_agent_connectors
)
from ....models import User
from ....schemas.connector_schemas import (
    ConnectorList, 
    ConnectorRead, 
    ConnectorStatus,
    UserConnectorCreate,
    UserConnectorUpdate,
    UserConnectorRead,
    UserConnectorList
)

router = APIRouter(prefix="/connectors")


@router.get("/catalog", response_model=ConnectorList)
async def list_connectors(
    status: Optional[ConnectorStatus] = Query(None, description="Filter by status (available, coming_soon, planned)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of all available connector types.
    
    This endpoint returns the catalog of all connector types that can potentially
    be used with AgentBase, including those that are coming soon or planned for future releases.
    
    Optionally filter by status:
    - available: Ready to use now
    - coming_soon: Will be available in an upcoming release
    - planned: On the roadmap but not yet implemented
    
    Returns:
        List of connector objects with their metadata
    """
    connectors = get_connector_registry(db, status.value if status else None)
    return {
        "connectors": connectors,
        "count": len(connectors)
    }


@router.post("/user", response_model=UserConnectorRead)
async def create_connector(
    connector: UserConnectorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new user-specific connector instance.
    
    This allows users to create their own configured instances of connectors
    from the connector catalog. Each user can have multiple instances
    of the same connector type (e.g., multiple Gmail accounts).
    
    Returns:
        Created connector instance details
    """
    user_connector = create_user_connector(db, current_user.id, connector)
    return get_user_connector(db, current_user.id, user_connector.id)


@router.get("/user", response_model=UserConnectorList)
async def list_user_connectors(
    include_details: bool = Query(False, description="Include connector type details"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of all connectors configured by the current user.
    
    This endpoint returns all connector instances that the user has created.
    
    Returns:
        List of user's connector instances
    """
    connectors = get_user_connectors(db, current_user.id, include_details)
    return {
        "connectors": connectors,
        "count": len(connectors)
    }


@router.get("/user/{connector_id}", response_model=UserConnectorRead)
async def get_connector(
    connector_id: uuid.UUID = Path(..., description="ID of the connector to retrieve"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific user connector instance.
    
    Returns:
        Connector instance details
    """
    return get_user_connector(db, current_user.id, connector_id)


@router.patch("/user/{connector_id}", response_model=UserConnectorRead)
async def update_connector(
    connector_id: uuid.UUID = Path(..., description="ID of the connector to update"),
    updates: UserConnectorUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a user connector instance.
    
    This can be used to change the name, configuration, or setup status of a connector.
    
    Returns:
        Updated connector instance details
    """
    return update_user_connector(db, current_user.id, connector_id, updates)


@router.delete("/user/{connector_id}")
async def delete_connector(
    connector_id: uuid.UUID = Path(..., description="ID of the connector to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user connector instance.
    
    This will also remove any links between the connector and agents.
    
    Returns:
        Deletion confirmation
    """
    delete_user_connector(db, current_user.id, connector_id)
    return {"message": "Connector deleted successfully"}


@router.post("/user/{connector_id}/link/{agent_id}")
async def link_to_agent(
    connector_id: uuid.UUID = Path(..., description="ID of the connector to link"),
    agent_id: uuid.UUID = Path(..., description="ID of the agent to link to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Link a connector to an agent.
    
    This allows the agent to use the connector to access external services.
    
    Returns:
        Link confirmation
    """
    return link_connector_to_agent(db, current_user.id, agent_id, connector_id)


@router.delete("/user/{connector_id}/link/{agent_id}")
async def unlink_from_agent(
    connector_id: uuid.UUID = Path(..., description="ID of the connector to unlink"),
    agent_id: uuid.UUID = Path(..., description="ID of the agent to unlink from"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unlink a connector from an agent.
    
    This removes the agent's access to the connector.
    
    Returns:
        Unlink confirmation
    """
    return unlink_connector_from_agent(db, current_user.id, agent_id, connector_id)


@router.get("/agent/{agent_id}", response_model=UserConnectorList)
async def get_connectors_for_agent(
    agent_id: uuid.UUID = Path(..., description="ID of the agent"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all connectors linked to a specific agent.
    
    Returns:
        List of connectors linked to the agent
    """
    connectors = get_agent_connectors(db, current_user.id, agent_id)
    return {
        "connectors": connectors,
        "count": len(connectors)
    } 