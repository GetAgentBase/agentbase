from typing import List, Optional, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..models import Agent, LLMConfig, User
from ..schemas.agent_schemas import AgentCreate, AgentUpdate


def get_agent_by_id(db: Session, agent_id: UUID, user_id: UUID) -> Optional[Agent]:
    """
    Get an agent by ID if it belongs to the specified user.
    
    Args:
        db: Database session
        agent_id: ID of the agent to retrieve
        user_id: ID of the user who should own the agent
        
    Returns:
        Agent or None if not found or not owned by user
    """
    return db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == user_id
    ).first()


def get_agents_by_user(db: Session, user_id: UUID) -> List[Agent]:
    """
    Get all agents belonging to a user.
    
    Args:
        db: Database session
        user_id: ID of the user whose agents to retrieve
        
    Returns:
        List of agents owned by the user
    """
    return db.query(Agent).filter(Agent.user_id == user_id).all()


def create_agent(db: Session, agent_data: AgentCreate, user_id: UUID) -> Agent:
    """
    Create a new agent for a user.
    
    Args:
        db: Database session
        agent_data: Data for the new agent
        user_id: ID of the user who will own the agent
        
    Returns:
        The newly created agent
        
    Raises:
        HTTPException: If agent creation fails
    """
    # Check if LLM config exists and belongs to user if provided
    if agent_data.llm_config_id:
        llm_config = db.query(LLMConfig).filter(
            LLMConfig.id == agent_data.llm_config_id,
            LLMConfig.user_id == user_id
        ).first()
        
        if not llm_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid LLM configuration specified"
            )
    
    # Create new agent object
    new_agent = Agent(
        user_id=user_id,
        name=agent_data.name,
        description=agent_data.description,
        system_prompt=agent_data.system_prompt,
        llm_config_id=agent_data.llm_config_id
    )
    
    try:
        # Add to database
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)
        return new_agent
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An agent with this name already exists"
        )


def update_agent(db: Session, agent_id: UUID, user_id: UUID, agent_data: AgentUpdate) -> Agent:
    """
    Update an existing agent.
    
    Args:
        db: Database session
        agent_id: ID of the agent to update
        user_id: ID of the user who owns the agent
        agent_data: Updated data for the agent
        
    Returns:
        The updated agent
        
    Raises:
        HTTPException: If agent update fails
    """
    # Get existing agent
    agent = get_agent_by_id(db, agent_id, user_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Check if LLM config exists and belongs to user if provided
    if agent_data.llm_config_id:
        llm_config = db.query(LLMConfig).filter(
            LLMConfig.id == agent_data.llm_config_id,
            LLMConfig.user_id == user_id
        ).first()
        
        if not llm_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid LLM configuration specified"
            )
    
    # Update fields if provided
    if agent_data.name is not None:
        agent.name = agent_data.name
    if agent_data.description is not None:
        agent.description = agent_data.description
    if agent_data.system_prompt is not None:
        agent.system_prompt = agent_data.system_prompt
    if agent_data.llm_config_id is not None:
        agent.llm_config_id = agent_data.llm_config_id
    
    try:
        # Commit changes
        db.commit()
        db.refresh(agent)
        return agent
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An agent with this name already exists"
        )


def delete_agent(db: Session, agent_id: UUID, user_id: UUID) -> bool:
    """
    Delete an agent.
    
    Args:
        db: Database session
        agent_id: ID of the agent to delete
        user_id: ID of the user who owns the agent
        
    Returns:
        True if agent was deleted, False otherwise
        
    Raises:
        HTTPException: If agent deletion fails
    """
    # Get existing agent
    agent = get_agent_by_id(db, agent_id, user_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Delete agent
    db.delete(agent)
    db.commit()
    return True 