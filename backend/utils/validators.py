import re


def validate_email(email: str) -> tuple[bool, str]:
    """
    Validate email format
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not email:
        return False, "Email is required"
    
    # RFC 5322 compliant email regex (simplified)
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    
    if len(email) > 254:
        return False, "Email is too long"
    
    print(f"✓ Email validation passed: {email}")
    return True, ""


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength
    
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 128:
        return False, "Password is too long (max 128 characters)"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    print("✓ Password validation passed")
    return True, ""


def validate_name(name: str) -> tuple[bool, str]:
    """
    Validate user's name
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not name:
        return False, "Name is required"
    
    if len(name.strip()) < 2:
        return False, "Name must be at least 2 characters long"
    
    if len(name) > 100:
        return False, "Name is too long (max 100 characters)"
    
    # Allow letters, spaces, hyphens, and apostrophes
    if not re.match(r"^[a-zA-Z\s\-']+$", name):
        return False, "Name can only contain letters, spaces, hyphens, and apostrophes"
    
    print(f"✓ Name validation passed: {name}")
    return True, ""


def validate_signup_data(name: str, email: str, password: str) -> tuple[bool, str]:
    """
    Validate all signup data
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Validate name
    is_valid, error = validate_name(name)
    if not is_valid:
        return False, error
    
    # Validate email
    is_valid, error = validate_email(email)
    if not is_valid:
        return False, error
    
    # Validate password
    is_valid, error = validate_password(password)
    if not is_valid:
        return False, error
    
    print("✓ All signup data validated successfully")
    return True, ""


def validate_login_data(email: str, password: str) -> tuple[bool, str]:
    """
    Validate login data
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not email:
        return False, "Email is required"
    
    if not password:
        return False, "Password is required"
    
    # Basic email format check for login
    is_valid, error = validate_email(email)
    if not is_valid:
        return False, error
    
    print(f"✓ Login data validated for: {email}")
    return True, ""
