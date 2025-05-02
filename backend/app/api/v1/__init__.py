"""
Version 1 API routes.
"""

from fastapi import APIRouter

api_router = APIRouter()

# Import and include all endpoint routers
from .endpoints import setup, auth, users, status, agents, connectors, chat, connector_setup

api_router.include_router(setup.router, tags=["setup"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(status.router, tags=["status"])
api_router.include_router(agents.router, tags=["agents"])
api_router.include_router(connectors.router, tags=["connectors"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(connector_setup.router, tags=["connector-setup"]) 