from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....services.setup_service import is_setup_complete
from pydantic import BaseModel

router = APIRouter()


class StatusResponse(BaseModel):
    """Response model for the status endpoint."""
    setup_required: bool


@router.get("/status", response_model=StatusResponse)
async def check_status(db: Session = Depends(get_db)):
    """
    Check the current status of the application.
    
    Returns whether initial setup is required (no superuser exists).
    
    Args:
        db: Database session
    
    Returns:
        Status information including whether setup is required
    """
    # Check if setup is completed (at least one superuser exists)
    setup_completed = is_setup_complete(db)
    
    # Return the status response
    return StatusResponse(
        setup_required=not setup_completed
    ) 