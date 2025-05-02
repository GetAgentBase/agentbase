"""
Services package for AgentBase.

This package contains service modules that implement business logic for the application.
"""

# Import services for easy access
from .connector_catalog import initialize_connector_registry, get_connector_registry
from .user_service import get_user_by_email, get_user_by_id
from .agent_service import (
    create_agent, 
    get_agent_by_id, 
    get_agents_by_user, 
    update_agent, 
    delete_agent
)
from .chat_service import get_chat_service
from .llm_config_service import (
    get_llm_configs_by_user,
    get_llm_config_by_id
)
from .setup_service import is_setup_complete
from .user_connector_service import (
    create_user_connector,
    get_user_connectors,
    get_user_connector,
    update_user_connector,
    delete_user_connector,
    link_connector_to_agent,
    unlink_connector_from_agent,
    get_agent_connectors
)

__all__ = [
    'initialize_connector_registry',
    'get_connector_registry',
    'get_user_by_email',
    'get_user_by_id',
    'create_agent',
    'get_agent_by_id',
    'get_agents_by_user',
    'update_agent',
    'delete_agent',
    'get_chat_service',
    'get_llm_configs_by_user',
    'get_llm_config_by_id',
    'is_setup_complete',
    'create_user_connector',
    'get_user_connectors',
    'get_user_connector',
    'update_user_connector',
    'delete_user_connector',
    'link_connector_to_agent',
    'unlink_connector_from_agent',
    'get_agent_connectors'
] 