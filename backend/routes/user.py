from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from bson import ObjectId
from database import generations_col
from utils.auth_middleware import require_auth

user_bp = Blueprint("user", __name__)


@user_bp.route("/my-generations", methods=["GET"])
@require_auth
def my_generations():
    """
    Get the current user's generation history (last 1 month only).
    Query params: ?category=<cat>
    Returns simplified data (no tokens/cost info).
    """
    try:
        user_id = request.user_id

        # Convert string id to ObjectId (user_id is stored as ObjectId in DB)
        try:
            user_oid = ObjectId(user_id)
        except Exception:
            user_oid = user_id

        # Only show last 1 month
        one_month_ago = datetime.utcnow() - timedelta(days=30)

        match_stage = {
            "user_id": user_oid,
            "created_at": {"$gte": one_month_ago},
        }

        # Optional category filter
        category = request.args.get("category")
        if category and category != "all":
            match_stage["category"] = category

        pipeline = [
            {"$match": match_stage},
            {"$sort": {"created_at": -1}},
            {"$limit": 100},
        ]

        gens = list(generations_col.aggregate(pipeline))

        results = []
        for g in gens:
            metadata = g.get("metadata", {})
            results.append({
                "id": str(g["_id"]),
                "category": g.get("category", ""),
                "sub_category": metadata.get("sub_category", ""),
                "prompt": g.get("prompt", ""),
                "total_images": metadata.get("total_images", 0),
                "result_urls": g.get("result_urls", []),
                "status": g.get("status", "unknown"),
                "created_at": g.get("created_at").isoformat() if g.get("created_at") else None,
            })

        # Get unique categories for filter options
        cat_pipeline = [
            {"$match": {"user_id": user_oid, "created_at": {"$gte": one_month_ago}}},
            {"$group": {"_id": "$category"}},
            {"$sort": {"_id": 1}},
        ]
        categories = [
            c["_id"] for c in generations_col.aggregate(cat_pipeline)
            if c["_id"]
        ]

        return jsonify({
            "generations": results,
            "total": len(results),
            "categories": categories,
        })

    except Exception as e:
        print(f"User generations error: {e}")
        return jsonify({"error": "Failed to get generations"}), 500


@user_bp.route("/my-profile", methods=["GET"])
@require_auth
def my_profile():
    """Get the current user's profile info."""
    try:
        user = request.current_user
        return jsonify({
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "profile_picture": user.get("profile_picture"),
            "status": user.get("status", "active"),
            "role": user.get("role", "user"),
            "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
        })
    except Exception as e:
        print(f"User profile error: {e}")
        return jsonify({"error": "Failed to get profile"}), 500
