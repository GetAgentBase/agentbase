from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
# Import your models if needed for early checks, though not strictly required for just starting
# from .models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Placeholder for startup/shutdown events (e.g., DB connection pool)
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AgentBase API starting up...")
    # Add DB initialization, Redis connection check etc. here later
    yield
    logger.info("AgentBase API shutting down...")

app = FastAPI(
    title="AgentBase API",
    description="The backend API for the AgentBase platform.",
    version="0.1.0", # Start versioning
    lifespan=lifespan
)

@app.get("/", tags=["Health"])
async def read_root():
    """Basic endpoint to check if the API is responding."""
    return {"message": "Welcome to AgentBase API"}

@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health check endpoint."""
    # In future, check DB and Redis connections here
    return {"status": "ok"}

# --- Routers Will Be Added Below in Phase 1 ---
# from .api import auth_router, agent_router # etc.
# app.include_router(auth_router, prefix="/v1/auth", tags=["Authentication"])
# app.include_router(agent_router, prefix="/v1/agents", tags=["Agents"])
# ... 