from sqlalchemy.orm import Session
from ..models import User
from typing import Optional


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email address.
    
    Args:
        db: Database session
        email: User's email address
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    Get a user by ID.
    
    Args:
        db: Database session
        user_id: User's ID (UUID)
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first() 