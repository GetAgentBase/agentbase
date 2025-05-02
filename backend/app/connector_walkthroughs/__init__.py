"""
Connector Setup Walkthroughs

This package contains detailed setup walkthroughs for different connector types.
These walkthroughs are exposed via API endpoints to guide users through the setup process.
"""

from .gmail import GMAIL_SETUP_WALKTHROUGH
from .google_calendar import GOOGLE_CALENDAR_SETUP_WALKTHROUGH
from .web_search import WEB_SEARCH_SETUP_WALKTHROUGH

# Map of connector names to walkthrough objects
CONNECTOR_WALKTHROUGHS = {
    "Gmail": GMAIL_SETUP_WALKTHROUGH,
    "Google Calendar": GOOGLE_CALENDAR_SETUP_WALKTHROUGH,
    "Web Search": WEB_SEARCH_SETUP_WALKTHROUGH
}

def get_walkthrough(connector_name):
    """
    Get the walkthrough for a specific connector.
    
    Args:
        connector_name: Name of the connector
        
    Returns:
        Walkthrough object or None if not found
    """
    return CONNECTOR_WALKTHROUGHS.get(connector_name)

def list_available_walkthroughs():
    """
    List all available connector walkthroughs.
    
    Returns:
        Dictionary of connector names to auth types
    """
    return {name: data["auth_type"] for name, data in CONNECTOR_WALKTHROUGHS.items()} 