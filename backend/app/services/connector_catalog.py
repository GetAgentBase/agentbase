"""
Connector Catalog - Registry of all connector types for AgentBase.

This module defines the built-in list of all connector types that AgentBase 
can potentially work with, whether they are fully implemented yet or not.
"""

import logging
import uuid
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..models import Tool

logger = logging.getLogger(__name__)

# Define connector registry with all supported connector types
# Each connector definition includes:
# - name: User-friendly name
# - description: Detailed explanation of what the connector does
# - tool_type: Type of authorization/configuration needed
# - config_schema: JSON schema for configuration (can be None for simple connectors)
# - execution_ref: Reference to the implementation function or module
# - status: Implementation status (available, coming_soon, planned)
CONNECTOR_REGISTRY = [
    {
        "name": "Gmail",
        "description": "Interacts with Gmail emails. Allows reading, sending, and organizing emails.",
        "tool_type": "oauth2",
        "config_schema": {
            "type": "object",
            "properties": {
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["https://www.googleapis.com/auth/gmail.readonly", 
                                "https://www.googleapis.com/auth/gmail.send"]
                    }
                }
            }
        },
        "execution_ref": "connectors.gmail",
        "status": "available"
    },
    {
        "name": "Google Calendar",
        "description": "Interacts with Google Calendar events. Enables viewing, creating, and managing calendar appointments.",
        "tool_type": "oauth2",
        "config_schema": {
            "type": "object",
            "properties": {
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["https://www.googleapis.com/auth/calendar.readonly",
                                "https://www.googleapis.com/auth/calendar.events"]
                    }
                }
            }
        },
        "execution_ref": "connectors.calendar",
        "status": "available"
    },
    {
        "name": "Web Search",
        "description": "Searches the web for real-time information.",
        "tool_type": "api_key",
        "config_schema": {
            "type": "object",
            "properties": {
                "search_engine": {
                    "type": "string",
                    "enum": ["google", "bing"]
                }
            }
        },
        "execution_ref": "connectors.web_search",
        "status": "available"
    }
]

def initialize_connector_registry(db: Session) -> None:
    """
    Initialize the connector registry in the database.
    
    This function should be called during application startup to ensure
    that all connector types are registered in the database.
    
    Args:
        db: SQLAlchemy database session
    """
    logger.info("Initializing connector registry...")
    
    try:
        # Get existing tools from database
        existing_tools = {tool.name: tool for tool in db.query(Tool).all()}
        
        # Update or insert each connector
        for connector in CONNECTOR_REGISTRY:
            if connector["name"] in existing_tools:
                # Update existing connector if needed
                tool = existing_tools[connector["name"]]
                tool.description = connector["description"]
                tool.tool_type = connector["tool_type"]
                tool.config_schema = connector["config_schema"]
                tool.execution_ref = connector["execution_ref"]
                logger.debug(f"Updated connector: {connector['name']}")
            else:
                # Insert new connector
                tool = Tool(
                    id=uuid.uuid4(),
                    name=connector["name"],
                    description=connector["description"],
                    tool_type=connector["tool_type"],
                    config_schema=connector["config_schema"],
                    execution_ref=connector["execution_ref"]
                )
                db.add(tool)
                logger.info(f"Added new connector: {connector['name']}")
        
        # Remove connectors that are no longer in the registry
        for tool_name, tool in existing_tools.items():
            if not any(connector["name"] == tool_name for connector in CONNECTOR_REGISTRY):
                logger.info(f"Removing connector that is no longer in registry: {tool_name}")
                db.delete(tool)
        
        db.commit()
        logger.info("Connector registry initialization complete")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error initializing connector registry: {e}")
        raise

def get_connector_registry(db: Session, status: Optional[str] = None) -> List[Dict]:
    """
    Get all registered connectors, optionally filtered by status.
    
    Args:
        db: SQLAlchemy database session
        status: Optional filter for connector status
        
    Returns:
        List of connector dictionaries
    """
    query = db.query(Tool)
    tools = query.all()
    
    # Convert to dictionary with status information
    result = []
    for tool in tools:
        # Find the matching registry entry to get status
        registry_entry = next((c for c in CONNECTOR_REGISTRY if c["name"] == tool.name), None)
        
        if registry_entry:
            tool_status = registry_entry.get("status", "available")
            
            # Filter by status if specified
            if status and tool_status != status:
                continue
                
            result.append({
                "id": str(tool.id),
                "name": tool.name,
                "description": tool.description,
                "tool_type": tool.tool_type,
                "config_schema": tool.config_schema,
                "execution_ref": tool.execution_ref,
                "status": tool_status
            })
    
    return result 