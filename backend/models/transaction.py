from datetime import datetime
from database import db
from bson import ObjectId

# Transactions collection
transactions_col = db["transactions"]


class Transaction:
    """Model for tracking in-app purchase transactions"""
    
    @staticmethod
    def create_transaction(
        user_id: str,
        product_id: str,
        purchase_token: str,
        credits: int,
        amount: float,
        currency: str = "INR",
        platform: str = "android",
        status: str = "pending"
    ):
        """
        Create a new transaction record
        
        Args:
            user_id: User's MongoDB ObjectId as string
            product_id: Google Play product ID (e.g., image_pack_10)
            purchase_token: Google Play purchase token for verification
            credits: Number of credits purchased
            amount: Purchase amount in INR
            currency: Currency code (default: INR)
            platform: Platform (android/ios)
            status: Transaction status (pending/success/failed/refunded/revoked)
            
        Returns:
            dict: Created transaction document
        """
        transaction_data = {
            "user_id": ObjectId(user_id),
            "product_id": product_id,
            "purchase_token": purchase_token,
            "credits": credits,
            "amount": amount,
            "currency": currency,
            "platform": platform,
            "status": status,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "verified_at": None,
            "refunded_at": None,
            "metadata": {}
        }
        
        result = transactions_col.insert_one(transaction_data)
        transaction_data["_id"] = result.inserted_id
        
        print(f"✓ Transaction created: {product_id} for user {user_id} (Status: {status})")
        return transaction_data
    
    @staticmethod
    def find_by_purchase_token(purchase_token: str):
        """Find transaction by purchase token (prevents duplicate processing)"""
        transaction = transactions_col.find_one({"purchase_token": purchase_token})
        return transaction
    
    @staticmethod
    def find_by_user(user_id: str, limit: int = 50):
        """Get all transactions for a user"""
        transactions = list(transactions_col.find(
            {"user_id": ObjectId(user_id)}
        ).sort("created_at", -1).limit(limit))
        
        print(f"Found {len(transactions)} transactions for user {user_id}")
        return transactions
    
    @staticmethod
    def update_status(transaction_id: str, status: str, metadata: dict = None):
        """
        Update transaction status
        
        Args:
            transaction_id: Transaction MongoDB ObjectId
            status: New status (success/failed/refunded/revoked)
            metadata: Additional metadata to store
        """
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if status == "success":
            update_data["verified_at"] = datetime.utcnow()
        elif status in ["refunded", "revoked"]:
            update_data["refunded_at"] = datetime.utcnow()
        
        if metadata:
            update_data["metadata"] = metadata
        
        result = transactions_col.update_one(
            {"_id": ObjectId(transaction_id)},
            {"$set": update_data}
        )
        
        print(f"Transaction {transaction_id} updated to status: {status}")
        return result.modified_count > 0
    
    @staticmethod
    def mark_as_verified(purchase_token: str, verification_data: dict):
        """Mark transaction as verified with Google Play API response"""
        result = transactions_col.update_one(
            {"purchase_token": purchase_token},
            {
                "$set": {
                    "status": "success",
                    "verified_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "metadata.verification": verification_data
                }
            }
        )
        
        print(f"Transaction with token {purchase_token[:20]}... marked as verified")
        return result.modified_count > 0
    
    @staticmethod
    def get_user_total_spent(user_id: str) -> dict:
        """Get total amount spent by user"""
        pipeline = [
            {
                "$match": {
                    "user_id": ObjectId(user_id),
                    "status": "success"
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_amount": {"$sum": "$amount"},
                    "total_credits": {"$sum": "$credits"},
                    "transaction_count": {"$sum": 1}
                }
            }
        ]
        
        result = list(transactions_col.aggregate(pipeline))
        
        if result:
            return {
                "total_amount": result[0].get("total_amount", 0),
                "total_credits": result[0].get("total_credits", 0),
                "transaction_count": result[0].get("transaction_count", 0)
            }
        
        return {
            "total_amount": 0,
            "total_credits": 0,
            "transaction_count": 0
        }
