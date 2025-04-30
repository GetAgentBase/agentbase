from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ....db.session import get_db
from ....models import User
from ....schemas.agent_schemas import AgentCreate, AgentUpdate, AgentResponse, AgentListResponse
from ....services.agent_service import (
    get_agent_by_id, 
    get_agents_by_user, 
    create_agent, 
    update_agent, 
    delete_agent
)
from ...dependencies import get_current_active_user

router = APIRouter()


@router.post("/agents", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new agent.
    
    Args:
        agent_data: Data for the new agent
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Newly created agent
    """
    return create_agent(db, agent_data, current_user.id)


@router.get("/agents", response_model=AgentListResponse)
async def list_agents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all agents belonging to the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of agents owned by the user
    """
    agents = get_agents_by_user(db, current_user.id)
    return AgentListResponse(agents=agents, count=len(agents))


@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent_details(
    agent_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific agent.
    
    Args:
        agent_id: ID of the agent to retrieve
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Agent details if found and owned by user
        
    Raises:
        HTTPException: If agent not found or not owned by user
    """
    agent = get_agent_by_id(db, agent_id, current_user.id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return agent


@router.put("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent_details(
    agent_id: UUID,
    agent_data: AgentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing agent.
    
    Args:
        agent_id: ID of the agent to update
        agent_data: Updated data for the agent
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated agent details
        
    Raises:
        HTTPException: If agent not found or update fails
    """
    return update_agent(db, agent_id, current_user.id, agent_data)


@router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent_by_id(
    agent_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an agent.
    
    Args:
        agent_id: ID of the agent to delete
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If agent not found or delete fails
    """
    delete_agent(db, agent_id, current_user.id)
    return None 