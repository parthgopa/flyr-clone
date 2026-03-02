import jwt
from datetime import datetime, timedelta
from config import config


def generate_token(user_id: str, email: str) -> str:
    """
    Generate JWT token for authenticated user
    
    Args:
        user_id: User's MongoDB ObjectId as string
        email: User's email address
        
    Returns:
        str: JWT token
    """
    payload = {
        "user_id": user_id,
        "email": email,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
    }
    
    token = jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")
    print(f"✓ JWT token generated for user: {email}")
    return token


def verify_token(token: str) -> dict:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
        print(f"✓ JWT token verified for user: {payload.get('email')}")
        return payload
    except jwt.ExpiredSignatureError:
        print("✗ JWT token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"✗ Invalid JWT token: {e}")
        return None


def decode_token_without_verification(token: str) -> dict:
    """
    Decode JWT token without verification (for debugging)
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Decoded token payload
    """
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None
