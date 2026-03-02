from flask import Blueprint, request, jsonify
from services.video_generation_service import generate_video_sync, refine_prompt_with_ai
from utils.auth_middleware import require_auth
from models.generation import Generation
import uuid

video_bp = Blueprint("video", __name__)

# Store active video generation operations
video_operations = {}

@video_bp.route("/refine-prompt", methods=["POST"])
def refine_prompt():
    """
    Refine user's prompt using AI with category-specific templates
    """
    try:
        data = request.json
        user_prompt = data.get("prompt")
        category = data.get("category", "general")
        
        if not user_prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        print(f"\n--- Refine Prompt Request ---")
        print(f"Category: {category}")
        print(f"Original Prompt: {user_prompt}")
        
        refined_prompt = refine_prompt_with_ai(user_prompt, category)
        
        print(f"✓ Prompt refined successfully")
        
        return jsonify({
            "success": True,
            "original_prompt": user_prompt,
            "refined_prompt": refined_prompt,
            "category": category
        })
        
    except Exception as e:
        print(f"✗ Prompt refinement failed: {str(e)}")
        return jsonify({"error": str(e)}), 500


@video_bp.route("/generate", methods=["POST"])
@require_auth
def start_video_generation():
    """
    Generate video and return video URI directly (blocking call)
    This will take 30-60 seconds to complete
    """
    try:
        data = request.json
        user_id = request.user_id  # From auth middleware
        
        prompt = data.get("prompt")
        category = data.get("category", "general")
        aspect_ratio = data.get("aspectRatio", "9:16")
        resolution = data.get("resolution", "720p")
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        print(f"\n--- Video Generation Request ---")
        print(f"Category: {category}")
        print(f"Prompt: {prompt}")
        print(f"Aspect Ratio: {aspect_ratio}")
        print(f"Resolution: {resolution}")
        
        # Generate video synchronously (waits for completion)
        video_uri = generate_video_sync(prompt, aspect_ratio, resolution)
        
        print(f"✓ Video generation completed successfully!")
        
        # Save generation record with userId
        try:
            Generation.create_generation(
                user_id=user_id,
                generation_type="video",
                category=category,
                prompt=prompt,
                result_urls=[video_uri],
                metadata={
                    "aspect_ratio": aspect_ratio,
                    "resolution": resolution,
                    "model": "veo-3.1-fast-generate-preview"
                }
            )
            print(f"Video generation record saved for user {user_id}")
        except Exception as e:
            print(f"Failed to save video generation record: {e}")
        
        return jsonify({
            "success": True,
            "video_uri": video_uri,
            "prompt": prompt,
            "category": category,
            "message": "Video generated successfully"
        })
        
    except Exception as e:
        print(f"✗ Video generation failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@video_bp.route("/status/<operation_id>", methods=["GET"])
def check_video_status(operation_id: str):
    """
    Poll endpoint to check video generation status
    """
    try:
        if operation_id not in video_operations:
            return jsonify({"error": "Operation not found"}), 404
        
        operation_data = video_operations[operation_id]
        operation_name = operation_data["operation_name"]
        
        print(f"\n--- Polling Video Status ---")
        print(f"Operation ID: {operation_id}")
        
        # Poll the operation
        result = poll_video_operation(operation_name)
        
        if result["done"]:
            if result["success"]:
                video_operations[operation_id]["status"] = "completed"
                video_operations[operation_id]["video_uri"] = result["video_uri"]
                
                print(f"✓ Video generation completed!")
                
                return jsonify({
                    "success": True,
                    "status": "completed",
                    "video_uri": result["video_uri"],
                    "prompt": operation_data["prompt"],
                    "category": operation_data["category"]
                })
            else:
                video_operations[operation_id]["status"] = "failed"
                
                print(f"✗ Video generation failed: {result.get('error', 'Unknown error')}")
                
                return jsonify({
                    "success": False,
                    "status": "failed",
                    "error": result.get("error", "Video generation failed")
                })
        else:
            print(f"⏳ Video still generating...")
            
            return jsonify({
                "success": True,
                "status": "generating",
                "message": "Video is still being generated"
            })
        
    except Exception as e:
        print(f"✗ Status check failed: {str(e)}")
        return jsonify({"error": str(e)}), 500


@video_bp.route("/test", methods=["GET"])
def test_video_endpoint():
    """Test endpoint"""
    return jsonify({"message": "Video generation endpoint is working"})
