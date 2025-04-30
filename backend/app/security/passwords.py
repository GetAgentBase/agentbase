from passlib.context import CryptContext

# Initialize password context with bcrypt as the hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to verify against
        
    Returns:
        True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """
    Hash a password for storage.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        The hashed password
    """
    return pwd_context.hash(password) 