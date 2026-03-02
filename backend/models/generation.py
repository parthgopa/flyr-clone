from datetime import datetime
from database import generations_col
from bson import ObjectId


class Generation:
    """Model for tracking user generations (images and videos)"""
    
    @staticmethod
    def create_generation(
        user_id: str,
        generation_type: str,  # 'image' or 'video'
        category: str,
        prompt: str,
        result_urls: list = None,
        metadata: dict = None
    ):
        """
        Create a new generation record
        
        Args:
            user_id: User's MongoDB ObjectId as string
            generation_type: Type of generation ('image' or 'video')
            category: Category of generation (jewelry, fashion, etc.)
            prompt: User's prompt for generation
            result_urls: List of generated image/video URLs
            metadata: Additional metadata (model used, settings, etc.)
            
        Returns:
            dict: Created generation document
        """
        generation_data = {
            "user_id": ObjectId(user_id),
            "generation_type": generation_type,
            "category": category,
            "prompt": prompt,
            "result_urls": result_urls or [],
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
            "status": "completed"  # completed, failed, pending
        }
        
        result = generations_col.insert_one(generation_data)
        generation_data["_id"] = result.inserted_id
        
        print(f"✓ Generation saved: {generation_type} for user {user_id}")
        return generation_data
    
    @staticmethod
    def find_by_user(user_id: str, limit: int = 50):
        """
        Get all generations for a user
        
        Args:
            user_id: User's MongoDB ObjectId as string
            limit: Maximum number of generations to return
            
        Returns:
            list: List of generation documents
        """
        generations = list(generations_col.find(
            {"user_id": ObjectId(user_id)}
        ).sort("created_at", -1).limit(limit))
        
        print(f"Found {len(generations)} generations for user {user_id}")
        return generations
    
    @staticmethod
    def find_by_id(generation_id: str):
        """Find generation by ID"""
        try:
            generation = generations_col.find_one({"_id": ObjectId(generation_id)})
            return generation
        except Exception as e:
            print(f"Error finding generation by ID: {e}")
            return None
    
    @staticmethod
    def get_user_stats(user_id: str):
        """
        Get generation statistics for a user
        
        Args:
            user_id: User's MongoDB ObjectId as string
            
        Returns:
            dict: Statistics including total generations, by type, by category
        """
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$group": {
                "_id": {
                    "type": "$generation_type",
                    "category": "$category"
                },
                "count": {"$sum": 1}
            }}
        ]
        
        results = list(generations_col.aggregate(pipeline))
        
        stats = {
            "total_generations": 0,
            "image_generations": 0,
            "video_generations": 0,
            "by_category": {}
        }
        
        for result in results:
            gen_type = result["_id"]["type"]
            category = result["_id"]["category"]
            count = result["count"]
            
            stats["total_generations"] += count
            
            if gen_type == "image":
                stats["image_generations"] += count
            elif gen_type == "video":
                stats["video_generations"] += count
            
            if category not in stats["by_category"]:
                stats["by_category"][category] = 0
            stats["by_category"][category] += count
        
        return stats
    
    @staticmethod
    def update_generation(generation_id: str, update_data: dict):
        """Update generation information"""
        result = generations_col.update_one(
            {"_id": ObjectId(generation_id)},
            {"$set": update_data}
        )
        print(f"Generation updated: {generation_id}, modified: {result.modified_count}")
        return result.modified_count > 0
