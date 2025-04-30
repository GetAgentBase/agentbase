from sqlalchemy.orm import Session
from ..models import User

def is_setup_complete(db: Session) -> bool:
    """
    Check if the initial admin setup has been completed.
    
    This function determines whether the application has been initialized with
    at least one superuser (admin) account, which is required for basic operation.
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        True if at least one superuser exists, False otherwise
    """
    # Count the number of users with superuser privileges
    superuser_count = db.query(User).filter(User.is_superuser == True).count()
    
    # Setup is complete if at least one superuser exists
    return superuser_count > 0 