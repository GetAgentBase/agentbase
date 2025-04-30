import os
import base64
import logging
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken

logger = logging.getLogger(__name__)

# Environment variable name for the Fernet key
FERNET_KEY_ENV = "AGENTBASE_FERNET_KEY"

# Global variable to cache the key within the same process
_CACHED_KEY = None


def get_fernet_key() -> bytes:
    """
    Get the Fernet encryption key from environment variable.
    If it doesn't exist, generate a new one.
    
    Returns:
        bytes: The Fernet key
    """
    global _CACHED_KEY
    
    # If we already have a cached key, use it
    if _CACHED_KEY is not None:
        return _CACHED_KEY
        
    key = os.getenv(FERNET_KEY_ENV)
    
    if key is None:
        # Generate a new key - this should normally happen only once during initial setup
        # In production, this key should be stored securely and persisted across container restarts
        logger.warning(
            f"{FERNET_KEY_ENV} not found in environment. "
            f"Generating a new key. Make sure to save this key for future use: "
            f"export {FERNET_KEY_ENV}=$(python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\")"
        )
        key = Fernet.generate_key().decode()
        
    # Ensure the key is properly encoded
    if isinstance(key, str):
        key = key.encode()
    
    # Cache the key for future use
    _CACHED_KEY = key
    return key


def encrypt_data(data: str) -> str:
    """
    Encrypt sensitive data using Fernet symmetric encryption.
    
    Args:
        data: Plain text data to encrypt
        
    Returns:
        URL-safe base64 encoded encrypted string
    """
    if not data:
        return ""
        
    key = get_fernet_key()
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())
    
    # Return as a string for easy storage in the database
    return encrypted_data.decode()


def decrypt_data(encrypted_data: str) -> Optional[str]:
    """
    Decrypt encrypted data using Fernet symmetric encryption.
    
    Args:
        encrypted_data: Encrypted data as a URL-safe base64 encoded string
        
    Returns:
        Decrypted data as a string, or None if decryption fails
    """
    if not encrypted_data:
        return None
        
    key = get_fernet_key()
    f = Fernet(key)
    
    try:
        # Convert from string to bytes for decryption
        if isinstance(encrypted_data, str):
            encrypted_data = encrypted_data.encode()
            
        decrypted_data = f.decrypt(encrypted_data)
        return decrypted_data.decode()
    except InvalidToken:
        logger.error("Failed to decrypt data. The encryption key may have changed or the data is corrupted.")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during decryption: {str(e)}")
        return None 