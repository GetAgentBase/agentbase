"""
User Connector Service

This module provides functions for managing user-specific connector instances.
"""

import logging
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from ..models import UserConnector, Tool, User, Agent, AgentConnectorLink
from ..schemas.connector_schemas import UserConnectorCreate, UserConnectorUpdate, SetupStatus

logger = logging.getLogger(__name__)

def create_user_connector(db: Session, user_id: uuid.UUID, connector: UserConnectorCreate) -> UserConnector:
    """
    Create a new user connector instance.
    
    Args:
        db: Database session
        user_id: ID of the user creating the connector
        connector: Connector creation data
        
    Returns:
        Created UserConnector object
    """
    try:
        # Check if connector type exists
        tool = db.query(Tool).filter(Tool.id == connector.tool_id).first()
        if not tool:
            raise HTTPException(status_code=404, detail=f"Connector type with ID {connector.tool_id} not found")
            
        # Create new user connector
        user_connector = UserConnector(
            id=uuid.uuid4(),
            user_id=user_id,
            tool_id=connector.tool_id,
            name=connector.name,
            setup_status=SetupStatus.NEEDS_SETUP.value,
            config_data=connector.config_data
        )
        
        db.add(user_connector)
        db.commit()
        db.refresh(user_connector)
        
        logger.info(f"Created user connector: {connector.name} for user {user_id}")
        return user_connector
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating user connector: {e}")
        raise HTTPException(status_code=500, detail="Database error creating connector")

def get_user_connectors(db: Session, user_id: uuid.UUID, include_details: bool = False) -> List[Dict[str, Any]]:
    """
    Get all connectors for a specific user.
    
    Args:
        db: Database session
        user_id: ID of the user
        include_details: Whether to include connector type details
        
    Returns:
        List of user connector objects
    """
    try:
        query = db.query(UserConnector).filter(UserConnector.user_id == user_id)
        user_connectors = query.all()
        
        result = []
        for uc in user_connectors:
            connector_data = {
                "id": str(uc.id),
                "user_id": str(uc.user_id),
                "tool_id": str(uc.tool_id),
                "name": uc.name,
                "setup_status": uc.setup_status,
                "config_data": uc.config_data,
                "created_at": uc.created_at.isoformat() if uc.created_at else None,
                "updated_at": uc.updated_at.isoformat() if uc.updated_at else None
            }
            
            # Include connector type details if requested
            if include_details:
                tool = db.query(Tool).filter(Tool.id == uc.tool_id).first()
                if tool:
                    # Get status from connector registry
                    from ..services.connector_catalog import CONNECTOR_REGISTRY
                    registry_entry = next((c for c in CONNECTOR_REGISTRY if c["name"] == tool.name), None)
                    status = registry_entry.get("status", "available") if registry_entry else "available"
                    
                    connector_data["connector_type"] = {
                        "id": str(tool.id),
                        "name": tool.name,
                        "description": tool.description,
                        "tool_type": tool.tool_type,
                        "config_schema": tool.config_schema,
                        "execution_ref": tool.execution_ref,
                        "status": status
                    }
            
            result.append(connector_data)
        
        return result
        
    except SQLAlchemyError as e:
        logger.error(f"Error getting user connectors: {e}")
        raise HTTPException(status_code=500, detail="Database error retrieving connectors")

def get_user_connector(db: Session, user_id: uuid.UUID, connector_id: uuid.UUID) -> Dict[str, Any]:
    """
    Get a specific user connector by ID.
    
    Args:
        db: Database session
        user_id: ID of the user
        connector_id: ID of the connector
        
    Returns:
        User connector data
    """
    try:
        uc = db.query(UserConnector).filter(
            UserConnector.id == connector_id,
            UserConnector.user_id == user_id
        ).first()
        
        if not uc:
            raise HTTPException(status_code=404, detail=f"Connector with ID {connector_id} not found")
            
        # Get tool details
        tool = db.query(Tool).filter(Tool.id == uc.tool_id).first()
        
        # Get status from connector registry
        from ..services.connector_catalog import CONNECTOR_REGISTRY
        registry_entry = next((c for c in CONNECTOR_REGISTRY if c["name"] == tool.name), None)
        status = registry_entry.get("status", "available") if registry_entry else "available"
        
        return {
            "id": str(uc.id),
            "user_id": str(uc.user_id),
            "tool_id": str(uc.tool_id),
            "name": uc.name,
            "setup_status": uc.setup_status,
            "config_data": uc.config_data,
            "created_at": uc.created_at.isoformat() if uc.created_at else None,
            "updated_at": uc.updated_at.isoformat() if uc.updated_at else None,
            "connector_type": {
                "id": str(tool.id),
                "name": tool.name,
                "description": tool.description,
                "tool_type": tool.tool_type,
                "config_schema": tool.config_schema,
                "execution_ref": tool.execution_ref,
                "status": status
            }
        }
        
    except SQLAlchemyError as e:
        logger.error(f"Error getting user connector: {e}")
        raise HTTPException(status_code=500, detail="Database error retrieving connector")

def update_user_connector(db: Session, user_id: uuid.UUID, connector_id: uuid.UUID, updates: UserConnectorUpdate) -> Dict[str, Any]:
    """
    Update a user connector.
    
    Args:
        db: Database session
        user_id: ID of the user
        connector_id: ID of the connector to update
        updates: Update data
        
    Returns:
        Updated user connector data
    """
    try:
        uc = db.query(UserConnector).filter(
            UserConnector.id == connector_id,
            UserConnector.user_id == user_id
        ).first()
        
        if not uc:
            raise HTTPException(status_code=404, detail=f"Connector with ID {connector_id} not found")
        
        # Update fields if provided
        if updates.name is not None:
            uc.name = updates.name
        if updates.config_data is not None:
            uc.config_data = updates.config_data
        if updates.setup_status is not None:
            uc.setup_status = updates.setup_status.value
            
        db.commit()
        db.refresh(uc)
        
        logger.info(f"Updated user connector: {uc.name} for user {user_id}")
        
        # Return updated connector data
        return get_user_connector(db, user_id, connector_id)
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating user connector: {e}")
        raise HTTPException(status_code=500, detail="Database error updating connector")

def delete_user_connector(db: Session, user_id: uuid.UUID, connector_id: uuid.UUID) -> bool:
    """
    Delete a user connector.
    
    Args:
        db: Database session
        user_id: ID of the user
        connector_id: ID of the connector to delete
        
    Returns:
        True if deleted successfully
    """
    try:
        uc = db.query(UserConnector).filter(
            UserConnector.id == connector_id,
            UserConnector.user_id == user_id
        ).first()
        
        if not uc:
            raise HTTPException(status_code=404, detail=f"Connector with ID {connector_id} not found")
            
        # Delete agent connector links first
        db.query(AgentConnectorLink).filter(
            AgentConnectorLink.user_connector_id == connector_id
        ).delete()
        
        # Delete the connector
        db.delete(uc)
        db.commit()
        
        logger.info(f"Deleted user connector: {connector_id} for user {user_id}")
        return True
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error deleting user connector: {e}")
        raise HTTPException(status_code=500, detail="Database error deleting connector")

def link_connector_to_agent(db: Session, user_id: uuid.UUID, agent_id: uuid.UUID, connector_id: uuid.UUID) -> Dict[str, Any]:
    """
    Link a user connector to an agent.
    
    Args:
        db: Database session
        user_id: ID of the user
        agent_id: ID of the agent
        connector_id: ID of the connector
        
    Returns:
        Link information
    """
    try:
        # Verify agent exists and belongs to user
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == user_id
        ).first()
        
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found")
            
        # Verify connector exists and belongs to user
        connector = db.query(UserConnector).filter(
            UserConnector.id == connector_id,
            UserConnector.user_id == user_id
        ).first()
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector with ID {connector_id} not found")
            
        # Check if link already exists
        existing_link = db.query(AgentConnectorLink).filter(
            AgentConnectorLink.agent_id == agent_id,
            AgentConnectorLink.user_connector_id == connector_id
        ).first()
        
        if existing_link:
            return {
                "agent_id": str(agent_id),
                "connector_id": str(connector_id),
                "message": "Link already exists"
            }
            
        # Create new link
        link = AgentConnectorLink(
            agent_id=agent_id,
            user_connector_id=connector_id
        )
        
        db.add(link)
        db.commit()
        
        logger.info(f"Linked connector {connector_id} to agent {agent_id}")
        
        return {
            "agent_id": str(agent_id),
            "connector_id": str(connector_id),
            "message": "Link created successfully"
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error linking connector to agent: {e}")
        raise HTTPException(status_code=500, detail="Database error creating link")

def unlink_connector_from_agent(db: Session, user_id: uuid.UUID, agent_id: uuid.UUID, connector_id: uuid.UUID) -> Dict[str, Any]:
    """
    Unlink a user connector from an agent.
    
    Args:
        db: Database session
        user_id: ID of the user
        agent_id: ID of the agent
        connector_id: ID of the connector
        
    Returns:
        Unlink confirmation
    """
    try:
        # Verify agent exists and belongs to user
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == user_id
        ).first()
        
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found")
            
        # Delete the link
        result = db.query(AgentConnectorLink).filter(
            AgentConnectorLink.agent_id == agent_id,
            AgentConnectorLink.user_connector_id == connector_id
        ).delete()
        
        db.commit()
        
        if result == 0:
            return {
                "agent_id": str(agent_id),
                "connector_id": str(connector_id),
                "message": "Link not found"
            }
            
        logger.info(f"Unlinked connector {connector_id} from agent {agent_id}")
        
        return {
            "agent_id": str(agent_id),
            "connector_id": str(connector_id),
            "message": "Link removed successfully"
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error unlinking connector from agent: {e}")
        raise HTTPException(status_code=500, detail="Database error removing link")

def get_agent_connectors(db: Session, user_id: uuid.UUID, agent_id: uuid.UUID) -> List[Dict[str, Any]]:
    """
    Get all connectors linked to a specific agent.
    
    Args:
        db: Database session
        user_id: ID of the user
        agent_id: ID of the agent
        
    Returns:
        List of connected connectors
    """
    try:
        # Verify agent exists and belongs to user
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == user_id
        ).first()
        
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found")
        
        # Get all linked connectors
        links = db.query(AgentConnectorLink).filter(
            AgentConnectorLink.agent_id == agent_id
        ).all()
        
        connector_ids = [link.user_connector_id for link in links]
        
        # Get connector details
        result = []
        for connector_id in connector_ids:
            connector_data = get_user_connector(db, user_id, connector_id)
            result.append(connector_data)
            
        return result
        
    except SQLAlchemyError as e:
        logger.error(f"Error getting agent connectors: {e}")
        raise HTTPException(status_code=500, detail="Database error retrieving agent connectors") 