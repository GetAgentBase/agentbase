from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from ..models import LLMConfig


def get_llm_configs_by_user(db: Session, user_id: UUID) -> List[LLMConfig]:
    """
    Get all LLM configurations for a user.
    
    Args:
        db: Database session
        user_id: User ID to get configurations for
        
    Returns:
        List of LLM configurations
    """
    return db.query(LLMConfig).filter(LLMConfig.user_id == user_id).all()


def get_llm_config_by_id(db: Session, config_id: UUID, user_id: UUID) -> LLMConfig:
    """
    Get a specific LLM configuration.
    
    Args:
        db: Database session
        config_id: ID of the LLM configuration to retrieve
        user_id: User ID to verify ownership
        
    Returns:
        LLM configuration if found and owned by user, None otherwise
    """
    return db.query(LLMConfig).filter(
        LLMConfig.id == config_id,
        LLMConfig.user_id == user_id
    ).first() 