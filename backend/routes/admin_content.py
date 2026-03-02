from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from database import categories_col, app_models_col, branding_bg_col, prompt_templates_col, users_col
from utils.auth_middleware import require_auth
from functools import wraps

admin_content_bp = Blueprint("admin_content", __name__)

def require_admin(f):
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        user = users_col.find_one({"_id": ObjectId(request.user_id)})
        if not user or user.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated

import os
from werkzeug.utils import secure_filename
import uuid

COLLECTIONS = {
    "categories": categories_col,
    "models": app_models_col,
    "backgrounds": branding_bg_col,
    "prompts": prompt_templates_col
}

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "admin")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@admin_content_bp.route("/upload", methods=["POST"])
@require_admin
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    filename_str = str(file.filename)
    if not filename_str:
        return jsonify({"error": "No selected file"}), 400
        
    ext = filename_str.rsplit('.', 1)[1].lower() if '.' in filename_str else 'png'
    filename = f"{uuid.uuid4().hex[:8]}_{secure_filename(filename_str)}"
    
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Return relative URL to save into db
    url = f"uploads/admin/{filename}"
    return jsonify({"success": True, "url": url})

@admin_content_bp.route("/<collection_name>", methods=["GET"])
@require_admin
def list_documents(collection_name):
    col = COLLECTIONS.get(collection_name)
    if col is None:
        return jsonify({"error": "Invalid collection"}), 400
    
    docs = list(col.find().sort("order", 1))
    for d in docs:
        d["_id"] = str(d["_id"])
        # Format datetime objects if any
        if "created_at" in d and isinstance(d["created_at"], datetime):
            d["created_at"] = d["created_at"].isoformat()
        if "updated_at" in d and isinstance(d["updated_at"], datetime):
            d["updated_at"] = d["updated_at"].isoformat()
            
    return jsonify(docs)

@admin_content_bp.route("/<collection_name>", methods=["POST"])
@require_admin
def create_document(collection_name):
    col = COLLECTIONS.get(collection_name)
    if col is None:
        return jsonify({"error": "Invalid collection"}), 400
    
    data = request.json
    if "_id" in data:
        del data["_id"]
    
    now = datetime.utcnow()
    data["created_at"] = now
    data["updated_at"] = now
    
    if "is_active" not in data:
        data["is_active"] = True
        
    res = col.insert_one(data)
    return jsonify({"success": True, "id": str(res.inserted_id)})

@admin_content_bp.route("/<collection_name>/<doc_id>", methods=["PUT"])
@require_admin
def update_document(collection_name, doc_id):
    col = COLLECTIONS.get(collection_name)
    if col is None:
        return jsonify({"error": "Invalid collection"}), 400
        
    data = request.json
    if "_id" in data:
        del data["_id"]
    # Handle potentially nested or object-like timestamps 
    if "created_at" in data:
        del data["created_at"]
    if "updated_at" in data:
        del data["updated_at"]
        
    data["updated_at"] = datetime.utcnow()
    
    col.update_one({"_id": ObjectId(doc_id)}, {"$set": data})
    return jsonify({"success": True})

@admin_content_bp.route("/<collection_name>/<doc_id>", methods=["DELETE"])
@require_admin
def delete_document(collection_name, doc_id):
    col = COLLECTIONS.get(collection_name)
    if col is None:
        return jsonify({"error": "Invalid collection"}), 400
        
    col.delete_one({"_id": ObjectId(doc_id)})
    return jsonify({"success": True})
