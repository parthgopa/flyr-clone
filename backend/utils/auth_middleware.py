from functools import wraps
from flask import request, jsonify
from utils.jwt_utils import verify_token
from models.user import User


def require_auth(f):
    """
    Decorator to require JWT authentication for routes
    Adds 'current_user' to request context
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                "success": False,
                "error": "Authorization header is required"
            }), 401
        
        # Extract token (format: "Bearer <token>")
        try:
            token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
        except IndexError:
            return jsonify({
                "success": False,
                "error": "Invalid authorization header format"
            }), 401
        
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
        
        # Check if user is active
        if user.get("status") != "active":
            return jsonify({
                "success": False,
                "error": "User account is not active"
            }), 403
        
        # Add user to request context
        request.current_user = user
        request.user_id = str(user["_id"])
        
        return f(*args, **kwargs)
    
    return decorated_function
