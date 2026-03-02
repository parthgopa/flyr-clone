from datetime import datetime
from database import users_col
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId


class User:
    """User model for authentication and user management"""
    
    @staticmethod
    def create_user(name: str, email: str, password: str = None, phone: str = None, google_id: str = None, profile_picture: str = None, status: str = "active", role: str = "user"):
        """
        Create a new user with email/password or Google OAuth
        
        Args:
            name: User's full name
            email: User's email address
            password: User's password (optional for Google OAuth)
            phone: User's phone number (optional)
            google_id: Google OAuth ID (optional)
            profile_picture: User's profile picture URL (optional)
            status: User account status (default: 'active')
            
        Returns:
            dict: Created user document
        """
        user_data = {
            "name": name,
            "email": email.lower(),
            "phone": phone,
            "google_id": google_id,
            "profile_picture": profile_picture,
            "status": status,
            "role": role,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            # Subscription-ready fields (for future use)
            "subscription": {
                "plan": "free",  # free, basic, premium
                "credits_remaining": 0,  # For pay-per-use model
                "credits_total": 0,
                "subscription_start": None,
                "subscription_end": None,
                "auto_renew": False
            }
        }
        
        # Hash password if provided (email/password signup)
        if password:
            user_data["password_hash"] = generate_password_hash(password)
        
        result = users_col.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        
        print(f"✓ User created: {email} (Status: {status})")
        return user_data
    
    @staticmethod
    def find_by_email(email: str):
        """Find user by email address"""
        user = users_col.find_one({"email": email.lower()})
        print(f"User lookup for {email}: {'Found' if user else 'Not found'}")
        return user
    
    @staticmethod
    def find_by_google_id(google_id: str):
        """Find user by Google OAuth ID"""
        user = users_col.find_one({"google_id": google_id})
        print(f"User lookup by Google ID: {'Found' if user else 'Not found'}")
        return user
    
    @staticmethod
    def find_by_id(user_id: str):
        """Find user by MongoDB ObjectId"""
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception as e:
            print(f"Error finding user by ID: {e}")
            return None
    
    @staticmethod
    def verify_password(user: dict, password: str) -> bool:
        """
        Verify user's password
        
        Args:
            user: User document from database
            password: Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        if not user or "password_hash" not in user:
            return False
        
        is_valid = check_password_hash(user["password_hash"], password)
        print(f"Password verification: {'Success' if is_valid else 'Failed'}")
        return is_valid
    
    @staticmethod
    def update_user(user_id: str, update_data: dict):
        """Update user information"""
        update_data["updated_at"] = datetime.utcnow()
        result = users_col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        print(f"User updated: {user_id}, modified: {result.modified_count}")
        return result.modified_count > 0
    
    @staticmethod
    def user_exists(email: str) -> bool:
        """Check if user with email already exists"""
        exists = users_col.count_documents({"email": email.lower()}) > 0
        print(f"User exists check for {email}: {exists}")
        return exists
