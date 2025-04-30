from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Add CORS middleware to allow cross-origin requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# --- API Routers ---
from .api.v1 import api_router
app.include_router(api_router, prefix="/api/v1")
