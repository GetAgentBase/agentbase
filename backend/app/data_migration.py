"""
This script adds LLM configurations for existing API keys in the database.
It's meant to be run once to migrate existing data.
"""

import sys
import asyncio
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import User, APIKey, LLMConfig

async def migrate_api_keys_to_llm_configs():
    """Create LLM configurations for existing API keys."""
    db = SessionLocal()
    try:
        # Get all API keys
        api_keys = db.query(APIKey).all()
        print(f"Found {len(api_keys)} API keys to process")
        
        for api_key in api_keys:
            # Check if user already has LLM configs
            existing_configs = db.query(LLMConfig).filter(
                LLMConfig.user_id == api_key.user_id
            ).count()
            
            if existing_configs > 0:
                print(f"User {api_key.user_id} already has {existing_configs} LLM configs, skipping")
                continue
                
            # Create LLM configs based on provider
            if api_key.provider_name.lower() == "openai":
                print(f"Creating OpenAI configs for user {api_key.user_id}")
                # Add GPT-4o configuration (default)
                gpt4o_config = LLMConfig(
                    user_id=api_key.user_id,
                    provider="openai",
                    model_name="gpt-4o",
                    encrypted_credentials=api_key.encrypted_key,
                    is_default=True
                )
                db.add(gpt4o_config)
                
                # Add GPT-3.5 Turbo configuration
                gpt35_config = LLMConfig(
                    user_id=api_key.user_id,
                    provider="openai",
                    model_name="gpt-3.5-turbo",
                    encrypted_credentials=api_key.encrypted_key,
                    is_default=False
                )
                db.add(gpt35_config)
                
            elif api_key.provider_name.lower() == "anthropic":
                print(f"Creating Anthropic configs for user {api_key.user_id}")
                # Add Claude 3 Opus configuration (default)
                claude_opus_config = LLMConfig(
                    user_id=api_key.user_id,
                    provider="anthropic",
                    model_name="claude-3-opus-20240229",
                    encrypted_credentials=api_key.encrypted_key,
                    is_default=True
                )
                db.add(claude_opus_config)
                
                # Add Claude 3 Sonnet configuration
                claude_sonnet_config = LLMConfig(
                    user_id=api_key.user_id,
                    provider="anthropic",
                    model_name="claude-3-sonnet-20240229",
                    encrypted_credentials=api_key.encrypted_key,
                    is_default=False
                )
                db.add(claude_sonnet_config)
                
                # Add Claude 3 Haiku configuration
                claude_haiku_config = LLMConfig(
                    user_id=api_key.user_id,
                    provider="anthropic",
                    model_name="claude-3-haiku-20240307",
                    encrypted_credentials=api_key.encrypted_key,
                    is_default=False
                )
                db.add(claude_haiku_config)
        
        # Commit changes
        db.commit()
        print("Migration completed successfully")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(migrate_api_keys_to_llm_configs()) 