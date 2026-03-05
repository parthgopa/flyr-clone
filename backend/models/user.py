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
            # Credits system for pay-per-use model
            "credits": 12,  # Default credits on signup
            "plan": "free",  # free, basic, premium
            # Legacy subscription fields (deprecated, use credits instead)
            "subscription": {
                "plan": "free",
                "credits_remaining": 12,
                "credits_total": 12,
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
    
    @staticmethod
    def get_credits(user_id: str) -> int:
        """Get user's current credit balance"""
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)}, {"credits": 1})
            if user:
                return user.get("credits", 0)
            return 0
        except Exception as e:
            print(f"Error getting credits for user {user_id}: {e}")
            return 0
    
    @staticmethod
    def add_credits(user_id: str, credits: int, reason: str = "purchase") -> bool:
        """
        Add credits to user's account
        
        Args:
            user_id: User's MongoDB ObjectId
            credits: Number of credits to add
            reason: Reason for adding credits (purchase, refund, bonus, etc.)
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            result = users_col.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$inc": {"credits": credits},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            print(f"✓ Added {credits} credits to user {user_id} (Reason: {reason})")
            return result.modified_count > 0
        except Exception as e:
            print(f"Error adding credits to user {user_id}: {e}")
            return False
    
    @staticmethod
    def deduct_credits(user_id: str, credits: int = 1, reason: str = "image_generation") -> dict:
        """
        Deduct credits from user's account
        
        Args:
            user_id: User's MongoDB ObjectId
            credits: Number of credits to deduct (default: 1)
            reason: Reason for deducting credits
        
        Returns:
            dict: {"success": bool, "remaining_credits": int, "message": str}
        """
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)}, {"credits": 1})
            
            if not user:
                return {"success": False, "remaining_credits": 0, "message": "User not found"}
            
            current_credits = user.get("credits", 0)
            
            if current_credits < credits:
                return {
                    "success": False,
                    "remaining_credits": current_credits,
                    "message": f"Insufficient credits. You have {current_credits} credits but need {credits}"
                }
            
            result = users_col.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$inc": {"credits": -credits},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            new_credits = current_credits - credits
            print(f"✓ Deducted {credits} credits from user {user_id} (Reason: {reason}, Remaining: {new_credits})")
            
            return {
                "success": True,
                "remaining_credits": new_credits,
                "message": f"Successfully deducted {credits} credits"
            }
        except Exception as e:
            print(f"Error deducting credits from user {user_id}: {e}")
            return {"success": False, "remaining_credits": 0, "message": str(e)}
