import base64
from google import genai
from google.genai import types
from config import config

# Initialize Client
client = genai.Client(api_key=config.GEMINI_API_KEY)


def generate_image_with_gemini(
    prompt: str,
    model_image_base64: str,
    product_image_base64: str
) -> tuple[bytes, dict]:
    """
    Uses Gemini with native image generation to fuse
    the model image and product image into a single output image.
    Both images are sent as input so the model can see and edit them directly.
    
    Returns:
        tuple: (image_bytes, token_usage_dict)
    """

    print("--- Generating image with Gemini (native image output) ---")

    # Decode base64 images to bytes
    model_bytes = base64.b64decode(model_image_base64)
    product_bytes = base64.b64decode(product_image_base64)

    # Build multi-part content: model image + product image + text prompt
    contents = [
        types.Part.from_bytes(data=model_bytes, mime_type="image/jpeg"),
        types.Part.from_text(text="Above is the MODEL / REFERENCE image of a person."),
        types.Part.from_bytes(data=product_bytes, mime_type="image/jpeg"),
        types.Part.from_text(text="Above is the PRODUCT image (jewelry / accessory / clothing)."),
        types.Part.from_text(text=f"""
{prompt}

IMPORTANT INSTRUCTIONS:
- Take the product from the PRODUCT image and place it naturally on the person in the MODEL image.
- Keep the person's face, pose, body, and background exactly as in the MODEL image.
- The product should look realistic: correct scale, lighting, shadows, and perspective.
- Output a single photorealistic image.
"""),
    ]

    response = client.models.generate_content(
        model="nano-banana-pro-preview",
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    # Extract token usage information
    token_usage = {
        "input_tokens": 0,
        "output_tokens": 0,
        "total_tokens": 0,
        "thoughts_tokens": 0,
        "image_tokens": 0,
        "text_tokens": 0
    }
    
    if hasattr(response, 'usage_metadata') and response.usage_metadata:
        usage = response.usage_metadata
        token_usage = {
            "input_tokens": usage.prompt_token_count or 0,
            "output_tokens": usage.candidates_token_count or 0,
            "total_tokens": usage.total_token_count or 0,
            "thoughts_tokens": usage.thoughts_token_count or 0,
            "image_tokens": 0,
            "text_tokens": 0
        }
        
        # Extract detailed token breakdown
        if hasattr(usage, 'prompt_tokens_details') and usage.prompt_tokens_details:
            for detail in usage.prompt_tokens_details:
                if hasattr(detail, 'modality') and hasattr(detail, 'token_count'):
                    if str(detail.modality) == 'MediaModality.IMAGE':
                        token_usage["image_tokens"] += detail.token_count
                    elif str(detail.modality) == 'MediaModality.TEXT':
                        token_usage["text_tokens"] += detail.token_count
        
        print(f"Token usage: {token_usage}")
        print(f"Response ID: {response.response_id}")
        print(f"Model version: {response.model_version}")

    # Extract the generated image from the response
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            print(f"Got image output: {part.inline_data.mime_type}, {len(part.inline_data.data)} bytes")
            return part.inline_data.data, token_usage

    raise RuntimeError("Gemini did not return an image in the response")


def generate_scenario_images(
    scenarios: list,
    category_id: str,
    model_image_base64: str,
    product_image_base64: str,
    build_prompt_fn
) -> list:
    """
    Generate one image per scenario. Returns a list of dicts:
      [{ "scenarioId": str, "label": str, "imageBytes": bytes }, ...]
    
    Each scenario is generated via a separate Gemini call so the
    prompt and background context differ per scenario.
    """
    results = []
    total = len(scenarios)

    for idx, scenario in enumerate(scenarios):
        scenario_id = scenario["id"]
        label = scenario["label"]
        hint = scenario.get("prompt_hint", "")

        print(f"[{idx+1}/{total}] Generating scenario: {label} ({scenario_id})")

        prompt = build_prompt_fn(category_id, scenario_hint=hint)

        try:
            image_bytes, token_usage = generate_image_with_gemini(
                prompt=prompt,
                model_image_base64=model_image_base64,
                product_image_base64=product_image_base64,
            )
            results.append({
                "scenarioId": scenario_id,
                "label": label,
                "imageBytes": image_bytes,
                "tokens": token_usage,
            })
            print(f"  ✓ Scenario '{label}' generated successfully")
            print(f"    Tokens used: {token_usage}")
        except Exception as e:
            print(f"  ✗ Scenario '{label}' failed: {e}")
            # Continue with remaining scenarios even if one fails

    return results


# --- Usage Example (Make sure you have dummy base64 strings to test) ---
# if __name__ == "__main__":
#     # Load your base64 strings here
#     # result_bytes = generate_blended_image("Put the product on the model", model_b64, prod_b64)
#     # with open("output.png", "wb") as f:
#     #     f.write(result_bytes)


def generate_branding_image_with_gemini(
    prompt: str,
    pose_image_base64: str,
    product_image_base64: str,
    logo_image_base64: str | None = None,
) -> tuple[bytes, dict]:
    """
    Generates a branded product image using Gemini native image generation.

    Inputs sent to the model:
      1. Pose / model reference image  — the chosen pose for the model
      2. Product image                 — the product to place on the model
      3. Logo image (optional)         — business logo to overlay on the result
      4. Prompt                        — detailed branding + composition instructions

    Returns:
        tuple: (image_bytes, token_usage_dict)
    """

    print("--- Generating branding image with Gemini ---")

    # Decode base64 images to bytes
    pose_bytes    = base64.b64decode(pose_image_base64)
    product_bytes = base64.b64decode(product_image_base64)

    # Build multi-part content
    contents = [
        types.Part.from_bytes(data=pose_bytes, mime_type="image/jpeg"),
        types.Part.from_text(text="Above is the MODEL POSE reference — keep the person's appearance exactly as shown."),
        types.Part.from_bytes(data=product_bytes, mime_type="image/jpeg"),
        types.Part.from_text(text="Above is the PRODUCT image — place this product realistically on the model."),
    ]

    # Optionally inject the business logo
    if logo_image_base64:
        try:
            logo_bytes = base64.b64decode(logo_image_base64)
            contents.append(types.Part.from_bytes(data=logo_bytes, mime_type="image/png"))
            contents.append(types.Part.from_text(
                text="Above is the BUSINESS LOGO — overlay it on the final branded image as instructed."
            ))
        except Exception as e:
            print(f"Warning: Could not decode logo image: {e}. Skipping logo.")

    # Append the main branding prompt
    contents.append(types.Part.from_text(text=f"""
{prompt}

CRITICAL RULES:
- Keep the model's face, pose, and body exactly as in the POSE reference image.
- Place the product from the PRODUCT image naturally on the model.
- Apply the background and branding elements as described.
- Output a single photorealistic image at the specified aspect ratio.
- Do NOT add speech bubbles, watermarks, or any unrelated elements.
"""))

    response = client.models.generate_content(
        model="nano-banana-pro-preview",
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    # ── Token usage ───────────────────────────────────────────────────────────
    token_usage = {
        "input_tokens":   0,
        "output_tokens":  0,
        "total_tokens":   0,
        "thoughts_tokens": 0,
        "image_tokens":   0,
        "text_tokens":    0,
    }

    if hasattr(response, "usage_metadata") and response.usage_metadata:
        usage = response.usage_metadata
        token_usage = {
            "input_tokens":    usage.prompt_token_count or 0,
            "output_tokens":   usage.candidates_token_count or 0,
            "total_tokens":    usage.total_token_count or 0,
            "thoughts_tokens": usage.thoughts_token_count or 0,
            "image_tokens":    0,
            "text_tokens":     0,
        }

        if hasattr(usage, "prompt_tokens_details") and usage.prompt_tokens_details:
            for detail in usage.prompt_tokens_details:
                if hasattr(detail, "modality") and hasattr(detail, "token_count"):
                    if str(detail.modality) == "MediaModality.IMAGE":
                        token_usage["image_tokens"] += detail.token_count
                    elif str(detail.modality) == "MediaModality.TEXT":
                        token_usage["text_tokens"] += detail.token_count

        print(f"[Branding] Token usage: {token_usage}")
        print(f"[Branding] Response ID: {response.response_id}")
        print(f"[Branding] Model version: {response.model_version}")

    # ── Extract generated image ───────────────────────────────────────────────
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            print(
                f"[Branding] Got image: {part.inline_data.mime_type}, "
                f"{len(part.inline_data.data)} bytes"
            )
            return part.inline_data.data, token_usage

    raise RuntimeError("[Branding] Gemini did not return an image in the response")
