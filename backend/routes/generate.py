import uuid
import threading
import base64
from flask import Blueprint, request, jsonify
from datetime import datetime
from services.gemini_image_service import generate_image_with_gemini, generate_branding_image_with_gemini
from utils.image_utils import save_image_bytes
from database import generations_col, users_col, categories_col, prompt_templates_col
from services.prompt_builder import build_prompt
from services.catalogue_prompt_generator import generate_catalogue_prompt
from services.branding_prompt_generator import generate_branding_prompt
from category_scenarios import get_scenarios as get_scenarios_fallback
from config import config
from utils.auth_middleware import require_auth
from models.generation import Generation

generate_bp = Blueprint("generate", __name__)

# In-memory job store  { jobId: { status, totalImages, images[], scenarios[], error } }
jobs = {}


def get_scenarios(category_id: str) -> list:
    """Fetch active scenarios from DB, fallback to hardcoded file."""
    try:
        cat = categories_col.find_one({"category_id": category_id})
        if cat and cat.get("scenarios"):
            active = [s for s in cat["scenarios"] if s.get("is_active", True)]
            if active:
                return active
    except Exception as e:
        print(f"⚠ DB scenario fetch failed, using fallback: {e}")
    return get_scenarios_fallback(category_id)


def get_user_data(user_id: str) -> dict:
    """Fetch user data from users collection"""
    try:
        from bson.objectid import ObjectId
        
        # Convert string ID to ObjectId if needed
        if isinstance(user_id, str):
            try:
                object_id = ObjectId(user_id)
            except:
                # If it's not a valid ObjectId, try as string
                object_id = user_id
        else:
            object_id = user_id
        
        user = users_col.find_one({"_id": object_id})
        print(f"Found user: {user}")
        
        if user:
            return {
                "name": user.get("name", "unknown"),
                "email": user.get("email", "unknown@unknown.com")
            }
        else:
            print(f"No user found with ID: {object_id}")
            return {"name": "unknown", "email": "unknown@unknown.com"}
    except Exception as e:
        print(f"Error fetching user data: {e}")
        return {"name": "unknown", "email": "unknown@unknown.com"}

def generate_creative_filename(user_data: dict, scenario_label: str, generation_type: str = "shoot") -> str:
    """Generate creative filename: name_email(before@)_date_time"""
    try:
        # Extract name and email parts
        name = user_data["name"].replace(" ", "_").lower()
        email = user_data["email"].split("@")[0]  # Get part before @
        
        # Clean scenario label
        scenario_clean = scenario_label.replace(" ", "_").replace("/", "_").lower()
        
        # Get current date and time
        now = datetime.now()
        date_str = now.strftime("%Y%m%d")
        time_str = now.strftime("%H%M%S")
        
        # Create filename
        filename = f"{name}_{email}_{scenario_clean}_{date_str}_{time_str}_{generation_type}.jpg"
        return filename
    except Exception as e:
        print(f"Error generating filename: {e}")
        # Fallback to simple naming
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"generated_{scenario_label}_{timestamp}_{generation_type}.jpg"


def save_product_image_from_base64(base64_str: str, user_data: dict, gen_type: str = "original") -> str:
    """Save the original product image from base64 and return the URL path."""
    try:
        image_bytes = base64.b64decode(base64_str)
        name = user_data.get("name", "unknown").replace(" ", "_").lower()
        email = user_data.get("email", "unknown").split("@")[0]
        now = datetime.now()
        filename = f"{name}_{email}_product_original_{now.strftime('%Y%m%d_%H%M%S')}_{gen_type}.jpg"
        saved_path = save_image_bytes(image_bytes, filename)
        print(f"  ✓ Original product image saved: {saved_path}")
        return saved_path
    except Exception as e:
        print(f"  ✗ Failed to save original product image: {e}")
        return None


def _run_generation(job_id: str, category_id: str, model_image: str, product_image: str, user_id: str = None):
    """Background worker: generates images one by one, updating the job store after each."""
    job = jobs[job_id]
    scenarios = job["scenarios"]
    total = len(scenarios)
    generated_urls = []
    total_tokens = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
    
    # Get user data for creative naming
    user_data = get_user_data(user_id) if user_id else {"name": "unknown", "email": "unknown@unknown.com"}

    # Save original product image to disk first
    original_product_url = save_product_image_from_base64(product_image, user_data, "shoot")

    for idx, scenario in enumerate(scenarios):
        scenario_id = scenario["id"]
        label = scenario["label"]
        hint = scenario.get("prompt_hint", "")

        print(f"[Job {job_id}] [{idx+1}/{total}] Generating: {label}")
        job["currentScenario"] = label

        try:
            prompt = build_prompt(category_id, scenario_hint=hint)
            
            # Generate image with token tracking
            image_bytes, token_usage = generate_image_with_gemini(
                prompt=prompt,
                model_image_base64=model_image,
                product_image_base64=product_image,
            )
            
            # Accumulate tokens
            total_tokens["input_tokens"] += token_usage["input_tokens"]
            total_tokens["output_tokens"] += token_usage["output_tokens"]
            total_tokens["total_tokens"] += token_usage["total_tokens"]
            
            # Generate creative filename
            creative_filename = generate_creative_filename(user_data, label, "shoot")
            
            # Save image with creative filename
            saved_path = save_image_bytes(image_bytes, creative_filename)
            image_url = f"{saved_path}"

            job["images"].append({
                "scenarioId": scenario_id,
                "label": label,
                "imageUrl": image_url,
                "filename": creative_filename,
                "tokens": token_usage
            })
            
            generated_urls.append(image_url)

            print(f"  ✓ {label} done ({len(job['images'])}/{total}) - Filename: {creative_filename}")
            print(f"    Tokens used: {token_usage}")

        except Exception as e:
            print(f"  ✗ {label} failed: {e}")
            job["errors"].append({"scenarioId": scenario_id, "label": label, "error": str(e)})

    job["status"] = "done"
    job["currentScenario"] = None
    job["total_tokens"] = total_tokens
    print(f"[Job {job_id}] Complete: {len(job['images'])}/{total} images")
    print(f"[Job {job_id}] Total tokens used: {total_tokens}")
    
    # Save generation record with userId if provided
    if user_id and generated_urls:
        try:
            # Prepend original product image URL to result_urls
            all_urls = [original_product_url] + generated_urls if original_product_url else generated_urls
            
            Generation.create_generation(
                user_id=user_id,
                generation_type="image",
                category=category_id,
                prompt=f"Generated {len(generated_urls)} images for {category_id}",
                result_urls=all_urls,
                metadata={
                    "job_id": job_id,
                    "scenarios": [s["label"] for s in scenarios],
                    "total_images": len(generated_urls),
                    "total_tokens": total_tokens,
                    "sub_category": "shoot",
                    "original_product_url": original_product_url,
                }
            )
            print(f"[Job {job_id}] Generation record saved for user {user_id}")
        except Exception as e:
            print(f"[Job {job_id}] Failed to save generation record: {e}")


@generate_bp.route("/generate-image", methods=["POST", "GET"])
@require_auth
def generate_image_route():
    """POST: Start a new generation job. Returns jobId immediately."""
    if request.method == "GET":
        return jsonify({"message": "Generate image endpoint"})

    data = request.json
    user_id = request.user_id  # From auth middleware

    category_id = data.get("categoryId")
    model_image = data.get("modelImage")
    product_image = data.get("productImage")

    if not product_image:
        return jsonify({"error": "Product image required"}), 400
    if not model_image:
        return jsonify({"error": "Model image required"}), 400

    scenarios = get_scenarios(category_id)
    job_id = str(uuid.uuid4())[:8]

    # Create job entry
    jobs[job_id] = {
        "status": "generating",
        "totalImages": len(scenarios),
        "images": [],
        "errors": [],
        "scenarios": scenarios,
        "currentScenario": None,
        "categoryId": category_id,
        "userId": user_id,
    }

    print(f"[Job {job_id}] Started: {len(scenarios)} scenario(s) for '{category_id}' (User: {user_id})")

    # Spawn background thread
    thread = threading.Thread(
        target=_run_generation,
        args=(job_id, category_id, model_image, product_image, user_id),
    )
    thread.daemon = True
    thread.start()

    # Return immediately with job info
    return jsonify({
        "jobId": job_id,
        "totalImages": len(scenarios),
        "scenarios": [{"id": s["id"], "label": s["label"]} for s in scenarios],
    })


def _run_catalogue_generation(job_id: str, category_id: str, model_images: list, product_image: str, model_labels: list, user_id: str = None):
    """Background worker for catalogue: generates images with multiple model images."""
    job = jobs[job_id]
    total = len(model_images)
    generated_urls = []
    total_tokens = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
    
    # Get user data for creative naming
    print(f"[Job {job_id}] Fetching user data for ID: {user_id}")
    user_data = get_user_data(user_id) if user_id else {"name": "unknown", "email": "unknown@unknown.com"}
    print(f"[Job {job_id}] User data fetched: {user_data}")

    # Save original product image to disk first
    original_product_url = save_product_image_from_base64(product_image, user_data, "catalogue")

    for idx, (model_image, label) in enumerate(zip(model_images, model_labels)):
        print(f"[Job {job_id}] [{idx+1}/{total}] Generating catalogue with: {label}")
        job["currentScenario"] = label

        try:
            # Generate highly accurate category-specific prompt
            prompt = generate_catalogue_prompt(category_id, label)
            
            print(f"[Job {job_id}] Generated prompt for {category_id}: {label}")
            print(f"Prompt length: {len(prompt)} characters")
            
            # Generate image with token tracking
            image_bytes, token_usage = generate_image_with_gemini(
                prompt=prompt,
                model_image_base64=model_image,
                product_image_base64=product_image,
            )
            
            # Accumulate tokens
            total_tokens["input_tokens"] += token_usage["input_tokens"]
            total_tokens["output_tokens"] += token_usage["output_tokens"]
            total_tokens["total_tokens"] += token_usage["total_tokens"]
            
            # Generate creative filename
            creative_filename = generate_creative_filename(user_data, label, "catalogue")
            
            # Save image with creative filename
            saved_path = save_image_bytes(image_bytes, creative_filename)
            image_url = f"{saved_path}"

            job["images"].append({
                "scenarioId": f"catalogue_{idx}",
                "label": label,
                "imageUrl": image_url,
                "filename": creative_filename,
                "tokens": token_usage
            })
            
            generated_urls.append(image_url)

            print(f"  ✓ {label} done ({len(job['images'])}/{total}) - Filename: {creative_filename}")
            print(f"    Tokens used: {token_usage}")

        except Exception as e:
            print(f"  ✗ {label} failed: {e}")
            job["errors"].append({"scenarioId": f"catalogue_{idx}", "label": label, "error": str(e)})

    job["status"] = "done"
    job["currentScenario"] = None
    job["total_tokens"] = total_tokens
    print(f"[Job {job_id}] Complete: {len(job['images'])}/{total} catalogue images")
    print(f"[Job {job_id}] Total tokens used: {total_tokens}")
    
    # Save generation record
    print(f"[Job {job_id}] Attempting to save generation record...")
    print(f"[Job {job_id}] User ID: {user_id}")
    print(f"[Job {job_id}] Generated URLs: {len(generated_urls)}")
    print(f"[Job {job_id}] User data: {user_data}")
    
    if user_id and generated_urls:
        try:
            # Prepend original product image URL to result_urls
            all_urls = [original_product_url] + generated_urls if original_product_url else generated_urls
            
            generation_data = {
                "user_id": user_id,
                "generation_type": "image",
                "category": category_id,
                "prompt": f"Generated {len(generated_urls)} catalogue images for {category_id}",
                "result_urls": all_urls,
                "metadata": {
                    "job_id": job_id,
                    "model_labels": model_labels,
                    "total_images": len(generated_urls),
                    "total_tokens": total_tokens,
                    "sub_category": "catalogue",
                    "original_product_url": original_product_url,
                }
            }
            
            print(f"[Job {job_id}] Generation data: {generation_data}")
            
            Generation.create_generation(**generation_data)
            print(f"[Job {job_id}] ✅ Catalogue generation record saved for user {user_id}")
        except Exception as e:
            print(f"[Job {job_id}] ❌ Failed to save generation record: {e}")
            import traceback
            traceback.print_exc()
    else:
        print(f"[Job {job_id}] ⚠️ Skipping database save - user_id: {user_id}, urls: {len(generated_urls)}")


@generate_bp.route("/generate-catalogue", methods=["POST"])
@require_auth
def generate_catalogue_route():
    """POST: Start a new catalogue generation job with multiple model images."""
    data = request.json
    user_id = request.user_id

    category_id = data.get("categoryId")
    model_images = data.get("modelImages", [])
    product_image = data.get("productImage")
    model_labels = data.get("modelLabels", [])

    if not product_image:
        return jsonify({"error": "Product image required"}), 400
    if not model_images or len(model_images) == 0:
        return jsonify({"error": "At least one model image required"}), 400

    # Create scenarios from model labels
    scenarios = [{"id": f"catalogue_{i}", "label": label} for i, label in enumerate(model_labels)]
    job_id = str(uuid.uuid4())[:8]

    # Create job entry
    jobs[job_id] = {
        "status": "generating",
        "totalImages": len(model_images),
        "images": [],
        "errors": [],
        "scenarios": scenarios,
        "currentScenario": None,
        "categoryId": category_id,
        "userId": user_id,
    }

    print(f"[Job {job_id}] Started catalogue: {len(model_images)} image(s) for '{category_id}' (User: {user_id})")

    # Spawn background thread
    thread = threading.Thread(
        target=_run_catalogue_generation,
        args=(job_id, category_id, model_images, product_image, model_labels, user_id),
    )
    thread.daemon = True
    thread.start()

    # Return immediately with job info
    return jsonify({
        "jobId": job_id,
        "totalImages": len(model_images),
        "scenarios": scenarios,
    })


@generate_bp.route("/job/<job_id>", methods=["GET"])
def get_job_status(job_id: str):
    """Poll endpoint: returns current job status + images generated so far."""
    job = jobs.get(job_id)
    
    # If job not in memory, try to retrieve from generations collection
    if not job:
        print(f"[Job {job_id}] Not found in memory, checking database...")
        generation = generations_col.find_one({"metadata.job_id": job_id})
        
        if generation:
            print(f"[Job {job_id}] Found in database, reconstructing job data")
            # Reconstruct job data from database record
            images = []
            for idx, url in enumerate(generation.get("result_urls", [])):
                scenario_label = generation["metadata"]["scenarios"][idx] if idx < len(generation["metadata"]["scenarios"]) else f"Image {idx+1}"
                images.append({
                    "scenarioId": f"scenario_{idx}",
                    "label": scenario_label,
                    "imageUrl": url
                })
            
            return jsonify({
                "jobId": job_id,
                "status": "done",
                "totalImages": generation["metadata"]["total_images"],
                "completedImages": len(images),
                "currentScenario": None,
                "images": images,
                "errors": [],
            })
        
        return jsonify({"error": "Job not found"}), 404

    return jsonify({
        "jobId": job_id,
        "status": job["status"],
        "totalImages": job["totalImages"],
        "completedImages": len(job["images"]),
        "currentScenario": job.get("currentScenario"),
        "images": job["images"],
        "errors": job["errors"],
    })


# ─── Branding Generation ─────────────────────────────────────────────────────

def _run_branding_generation(
    job_id: str,
    category_id: str,
    model_id: str,
    pose_image: str,
    product_image: str,
    logo_image: str | None,
    branding_meta: dict,
    user_id: str = None
):
    """Background worker for branding: generates branded product images."""
    job = jobs[job_id]
    scenarios = job["scenarios"]
    total = len(scenarios)
    generated_urls = []
    total_tokens = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}

    user_data = get_user_data(user_id) if user_id else {"name": "unknown", "email": "unknown@unknown.com"}
    print(f"[Job {job_id}] Branding started for user: {user_data}")

    # Save original product image to disk first
    original_product_url = save_product_image_from_base64(product_image, user_data, "branding")

    for idx, scenario in enumerate(scenarios):
        scenario_id = scenario["id"]
        label = scenario["label"]

        print(f"[Job {job_id}] [{idx+1}/{total}] Generating branding: {label}")
        job["currentScenario"] = label

        try:
            prompt = generate_branding_prompt(
                category_id=category_id,
                label=label,
                branding_meta=branding_meta,
            )

            image_bytes, token_usage = generate_branding_image_with_gemini(
                prompt=prompt,
                pose_image_base64=pose_image,
                product_image_base64=product_image,
                logo_image_base64=logo_image,
            )

            total_tokens["input_tokens"] += token_usage["input_tokens"]
            total_tokens["output_tokens"] += token_usage["output_tokens"]
            total_tokens["total_tokens"] += token_usage["total_tokens"]

            creative_filename = generate_creative_filename(user_data, label, "branding")
            saved_path = save_image_bytes(image_bytes, creative_filename)
            image_url = f"{saved_path}"

            job["images"].append({
                "scenarioId": scenario_id,
                "label": label,
                "imageUrl": image_url,
                "filename": creative_filename,
                "tokens": token_usage,
            })
            generated_urls.append(image_url)

            print(f"  ✓ {label} done ({len(job['images'])}/{total}) - Tokens: {token_usage}")

        except Exception as e:
            print(f"  ✗ {label} failed: {e}")
            job["errors"].append({"scenarioId": scenario_id, "label": label, "error": str(e)})

    job["status"] = "done"
    job["currentScenario"] = None
    job["total_tokens"] = total_tokens
    print(f"[Job {job_id}] Branding complete: {len(job['images'])}/{total} images")
    print(f"[Job {job_id}] Total tokens: {total_tokens}")

    # Persist to database
    if user_id and generated_urls:
        try:
            # Prepend original product image URL to result_urls
            all_urls = [original_product_url] + generated_urls if original_product_url else generated_urls
            
            Generation.create_generation(
                user_id=user_id,
                generation_type="image",
                category=category_id,
                prompt=f"Branding: {branding_meta.get('businessName', 'unknown')}",
                result_urls=all_urls,
                metadata={
                    "job_id": job_id,
                    "scenarios": [s["label"] for s in scenarios],
                    "total_images": len(generated_urls),
                    "total_tokens": total_tokens,
                    "sub_category": "branding",
                    "model_id": model_id,
                    "business_name": branding_meta.get("businessName", ""),
                    "aspect_ratio": branding_meta.get("aspectRatio", "4:5"),
                    "background": branding_meta.get("backgroundLabel", ""),
                    "original_product_url": original_product_url,
                },
            )
            print(f"[Job {job_id}] ✅ Branding record saved for user {user_id}")
        except Exception as e:
            print(f"[Job {job_id}] ❌ Failed to save branding record: {e}")
            import traceback
            traceback.print_exc()


@generate_bp.route("/generate-branding", methods=["POST"])
@require_auth
def generate_branding_route():
    """POST: Start a branding generation job."""
    data = request.json
    user_id = request.user_id

    category_id   = data.get("categoryId")
    model_id      = data.get("modelId")
    pose_image    = data.get("poseImage")
    product_image = data.get("productImage")
    logo_image    = data.get("logoImage")  # optional

    branding_meta = {
        "businessName":           data.get("businessName", ""),
        "phoneNumber":            data.get("phoneNumber", ""),
        "address":                data.get("address", ""),
        "webUrl":                 data.get("webUrl", ""),
        "backgroundColor":        data.get("backgroundColor", None),
        "backgroundLabel":        data.get("backgroundLabel", "White"),
        "aspectRatio":            data.get("aspectRatio", "4:5"),
        "aspectRatioDescription": data.get("aspectRatioDescription", ""),
        "hasLogo":                logo_image is not None,   # ← tells prompt writer
    }

    if not product_image:
        return jsonify({"error": "Product image required"}), 400
    if not pose_image:
        return jsonify({"error": "Pose (model) image required"}), 400

    # Build scenarios: one branded image per variation
    # Currently one primary scenario; expand list to generate more variations.
    scenarios = [
        {"id": "branding_primary", "label": f"{branding_meta['businessName']} — Main"},
        {"id": "branding_clean",   "label": f"{branding_meta['businessName']} — Clean"},
    ]

    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {
        "status": "generating",
        "totalImages": len(scenarios),
        "images": [],
        "errors": [],
        "scenarios": scenarios,
        "currentScenario": None,
        "categoryId": category_id,
        "userId": user_id,
    }

    print(f"[Job {job_id}] Started branding: {len(scenarios)} scenario(s) for '{category_id}' (User: {user_id})")

    thread = threading.Thread(
        target=_run_branding_generation,
        args=(job_id, category_id, model_id, pose_image, product_image, logo_image, branding_meta, user_id),
    )
    thread.daemon = True
    thread.start()

    return jsonify({
        "jobId": job_id,
        "totalImages": len(scenarios),
        "scenarios": scenarios,
    })
