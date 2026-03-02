from flask import Blueprint, request, jsonify
from models.user import User
from utils.validators import validate_signup_data, validate_login_data
from utils.jwt_utils import generate_token, verify_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from config import config

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    User signup with email and password
    
    Request body:
        {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "SecurePass123!"
        }
    
    Returns:
        {
            "success": true,
            "message": "User created successfully",
            "token": "jwt_token_here",
            "user": {
                "id": "user_id",
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    """
    try:
        data = request.json
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        password = data.get("password", "")
        
        print(f"\n--- Signup Request ---")
        print(f"Name: {name}")
        print(f"Email: {email}")
        print(f"Phone: {phone}")
        
        # Validate input data
        is_valid, error_message = validate_signup_data(name, email, password)
        if not is_valid:
            print(f"✗ Validation failed: {error_message}")
            return jsonify({
                "success": False,
                "error": error_message
            }), 400
        
        # Check if user already exists
        if User.user_exists(email):
            print(f"✗ User already exists: {email}")
            return jsonify({
                "success": False,
                "error": "User with this email already exists"
            }), 409
        
        # Create new user with phone and status='active', role='user'
        user = User.create_user(
            name=name, 
            email=email, 
            phone=phone,
            password=password,
            status="active",
            role="user"
        )
        
        # Generate JWT token
        token = generate_token(str(user["_id"]), user["email"])
        
        print(f"✓ Signup successful for: {email}\n")
        
        return jsonify({
            "success": True,
            "message": "User created successfully",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "phone": user.get("phone"),
                "profile_picture": user.get("profile_picture"),
                "status": user.get("status"),
                "role": user.get("role", "user")
            }
        }), 201
        
    except Exception as e:
        print(f"✗ Signup error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    User login with email and password
    
    Request body:
        {
            "email": "john@example.com",
            "password": "SecurePass123!"
        }
    
    Returns:
        {
            "success": true,
            "message": "Login successful",
            "token": "jwt_token_here",
            "user": {
                "id": "user_id",
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    """
    try:
        data = request.json
        email = data.get("email", "").strip()
        password = data.get("password", "")
        
        print(f"\n--- Login Request ---")
        print(f"Email: {email}")
        
        # Validate input data
        is_valid, error_message = validate_login_data(email, password)
        if not is_valid:
            print(f"✗ Validation failed: {error_message}")
            return jsonify({
                "success": False,
                "error": error_message
            }), 400
        
        # Find user by email
        user = User.find_by_email(email)
        if not user:
            print(f"✗ User not found: {email}")
            return jsonify({
                "success": False,
                "error": "Invalid email or password"
            }), 401
        
        # Check if user status is active
        if user.get("status") != "active":
            print(f"✗ User account is not active: {email}")
            return jsonify({
                "success": False,
                "error": "Your account is not active. Please contact support."
            }), 403
        
        # Verify password
        if not User.verify_password(user, password):
            print(f"✗ Invalid password for: {email}")
            return jsonify({
                "success": False,
                "error": "Invalid email or password"
            }), 401
        
        # Generate JWT token
        token = generate_token(str(user["_id"]), user["email"])
        
        print(f"✓ Login successful for: {email}\n")
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "profile_picture": user.get("profile_picture"),
                "role": user.get("role", "user")
            }
        }), 200
        
    except Exception as e:
        print(f"✗ Login error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


@auth_bp.route("/google-signin", methods=["POST"])
def google_signin():
    """
    Google OAuth sign-in
    
    Request body:
        {
            "id_token": "google_id_token_here"
        }
    
    Returns:
        {
            "success": true,
            "message": "Login successful",
            "token": "jwt_token_here",
            "user": {
                "id": "user_id",
                "name": "John Doe",
                "email": "john@example.com",
                "profile_picture": "https://..."
            }
        }
    """
    try:
        data = request.json
        google_id_token = data.get("id_token")
        
        print(f"\n--- Google Sign-In Request ---")
        
        if not google_id_token:
            return jsonify({
                "success": False,
                "error": "Google ID token is required"
            }), 400
        
        # Verify Google ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                google_id_token,
                google_requests.Request(),
                config.GOOGLE_CLIENT_ID
            )
            
            google_user_id = idinfo["sub"]
            email = idinfo["email"]
            name = idinfo.get("name", "")
            profile_picture = idinfo.get("picture", "")
            
            print(f"Google user verified: {email}")
            
        except ValueError as e:
            print(f"✗ Invalid Google token: {e}")
            return jsonify({
                "success": False,
                "error": "Invalid Google token"
            }), 401
        
        # Check if user exists by Google ID
        user = User.find_by_google_id(google_user_id)
        
        if not user:
            # Check if user exists by email
            user = User.find_by_email(email)
            
            if user:
                # Link Google account to existing user
                User.update_user(str(user["_id"]), {
                    "google_id": google_user_id,
                    "profile_picture": profile_picture
                })
                print(f"✓ Google account linked to existing user: {email}")
            else:
                # Create new user with Google account
                user = User.create_user(
                    name=name,
                    email=email,
                    google_id=google_user_id,
                    profile_picture=profile_picture
                )
                print(f"✓ New user created via Google: {email}")
        
        # Generate JWT token
        token = generate_token(str(user["_id"]), user["email"])
        
        print(f"✓ Google sign-in successful for: {email}\n")
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "phone": user.get("phone"),
                "profile_picture": user.get("profile_picture"),
                "status": user.get("status", "active"),
                "role": user.get("role", "user")
            }
        }), 200
        
    except Exception as e:
        print(f"✗ Google sign-in error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


@auth_bp.route("/verify-token", methods=["POST"])
def verify_user_token():
    """
    Verify JWT token and return user info
    
    Request body:
        {
            "token": "jwt_token_here"
        }
    
    Returns:
        {
            "success": true,
            "user": {
                "id": "user_id",
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    """
    try:
        data = request.json
        token = data.get("token")
        
        if not token:
            return jsonify({
                "success": False,
                "error": "Token is required"
            }), 400
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return jsonify({
                "success": False,
                "error": "Invalid or expired token"
            }), 401
        
        # Get user from database
        user = User.find_by_id(payload["user_id"])
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        return jsonify({
            "success": True,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "phone": user.get("phone"),
                "profile_picture": user.get("profile_picture"),
                "status": user.get("status"),
                "role": user.get("role", "user")
            }
        }), 200
        
    except Exception as e:
        print(f"✗ Token verification error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


@auth_bp.route("/test", methods=["GET"])
def test_auth():
    """Test endpoint to verify auth routes are working"""
    return jsonify({
        "message": "Auth routes are working!",
        "endpoints": [
            "POST /auth/signup",
            "POST /auth/login",
            "POST /auth/google-signin",
            "POST /auth/verify-token"
        ]
    })
