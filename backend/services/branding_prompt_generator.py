"""
Branding Prompt Generator — Skilled Prompt Writer for Gemini Image Generation.

Generates highly detailed, multi-layered prompts designed to produce
professional, print-quality branded product images.

Prompt strategy:
  ① Scene / art-direction framing  (what kind of image this should look like)
  ② Subject lock                   (preserve the model / pose exactly)
  ③ Product integration            (realistic, physically accurate placement)
  ④ Background & environment       (color / texture / lighting mood)
  ⑤ Branding overlay               (logo, name, contact details — if required)
  ⑥ Composition & aspect ratio     (rule-of-thirds, safe zones, framing)
  ⑦ Technical quality bar          (resolution, lighting, sharpness spec)
  ⑧ Negative constraints           (things to avoid / never do)
"""

from database import categories_col

# ─── Category art-direction library (fallback) ───────────────────────────────
_CATEGORY_STYLE = {
    "jewelry": "Luxury jewelry editorial. Soft, directional studio lighting with subtle rim light to make metals and gems sparkle. Elegant, timeless, aspirational mood. The jewelry should glint with realistic light reflection and refraction. The model is wearing the jewelry naturally; skin tone and facial features are pristine.",
    "fashion": "High-fashion lifestyle editorial. Studio-grade three-point lighting; bright, clean whites. Confident, stylish, contemporary mood. Clothing drapes naturally on the body with correct folds, creases, and texture. The model is posed confidently; outfit fits perfectly with no distortion.",
    "home": "Premium interior / lifestyle product photography. Warm, diffused natural window light from one side. Warm, inviting, aspirational domestic aesthetic. The home product should look as if it naturally belongs in the scene. The model interacts naturally with the environment.",
    "kitchen": "Food & kitchenware lifestyle photography. Bright, clean overhead and side lighting; true-to-life colors. Fresh, clean, appetizing, modern kitchen feel. Kitchen items should look practical and premium; surfaces must appear clean. The model uses the product naturally.",
    "electronics": "Tech product advertising photography. Cool, crisp studio lighting; sharp reflections on glass and metal surfaces. Sleek, cutting-edge, innovative mood. Screens should appear with accurate color reproduction; device surfaces pristine. The model uses the tech naturally, conveying ease of use.",
    "beauty": "Beauty & cosmetics editorial. Soft beauty lighting — large softbox or ring light; flawless skin rendering. Glowing, fresh, radiant, luxurious mood. Cosmetic product packaging must be clearly visible and pristine. The model's skin, makeup, and expression are flawless and editorial-grade.",
    "sports": "Sports & activewear performance photography. High-key studio lighting; sharp, energetic feel. Dynamic, powerful, athletic, motivational mood. Product appears functional and performance-oriented; no wrinkles unless intentional. The model conveys energy, strength, or motion even in a static pose.",
}

_DEFAULT_STYLE = "Professional e-commerce product photography. Balanced studio lighting with soft shadows. Clean, professional, trustworthy. Product is clearly visible and accurately represented. The model looks natural and relatable."


def _build_background_block(bg_color: str | None, bg_label: str, bg_is_image: bool) -> str:
    if bg_is_image:
        return (
            f"BACKGROUND — use the provided background IMAGE texture called '{bg_label}'. "
            "Seamlessly composite the background behind the model, ensuring reflections, shadows, "
            "and ambient light from the background fall naturally on the model and product. "
            "The background texture must tile or scale cleanly with no obvious seams or distortions."
        )
    elif bg_color:
        return (
            f"BACKGROUND — fill with a perfectly uniform solid color (hex: {bg_color}, label: {bg_label}). "
            "The background must be completely clean — no gradients, vignettes, noise, or texture. "
            "Product and model shadows should cast softly onto this background at a believable angle. "
            "Ensure color accuracy: the rendered background hex must match the specified value."
        )
    else:
        return (
            f"BACKGROUND — apply a clean {bg_label} studio background. "
            "It should feel premium and professional with soft shadow falloff at the base of the model."
        )


def _build_branding_block(
    is_clean: bool,
    business_name: str,
    phone_number: str,
    address: str,
    web_url: str,
    has_logo: bool,
) -> str:
    if is_clean:
        return (
            "BRANDING — CLEAN VARIANT: Do NOT add any text, logos, watermarks, phone numbers, "
            "addresses, website URLs, or any overlay elements. "
            "Output a pure, uncluttered product-on-model image ready for white-label use."
        )

    lines = []
    lines.append("BRANDING — MAIN VARIANT: Add the following professional branding overlay:")
    lines.append("")

    # Business name — largest typography element
    lines.append(
        f'  • Business Name: "{business_name}"'
        "\n    → Display in bold, premium sans-serif typography."
        "\n    → Position at the bottom of the frame in a dedicated branding strip."
        "\n    → Text must be clearly legible at small display sizes."
        "\n    → Use high-contrast colors: white text on dark strip, or dark text on light strip."
    )

    # Logo
    if has_logo:
        lines.append(
            "  • Business Logo: Place the logo image (provided) in the bottom-left corner of"
            " the branding strip, OR top-right corner of the image — whichever is less obtrusive."
            "\n    → Maintain original aspect ratio of the logo."
            "\n    → Minimum 60px equivalent height so it is legible but not dominant."
            "\n    → Do not stretch, warp, or recolor the logo."
        )

    # Contact details
    contact_parts = []
    if phone_number:
        contact_parts.append(f"📞 {phone_number}")
    if address:
        contact_parts.append(f"📍 {address}")
    if web_url:
        contact_parts.append(f"🌐 {web_url}")

    if contact_parts:
        contact_line = "  |  ".join(contact_parts)
        lines.append(
            f"  • Contact Details: {contact_line}"
            "\n    → Display in smaller type below the business name."
            "\n    → Same high-contrast style as the business name."
        )

    lines.append("")
    lines.append(
        "  BRANDING STRIP GUIDELINES:"
        "\n    → The branding strip should occupy max 15% of the total image height at the bottom."
        "\n    → Semi-transparent dark overlay (rgba(0,0,0,0.65)) or solid brand-color strip."
        "\n    → All text and logos must be sharp — no blur or low-resolution rendering."
        "\n    → The branding area must NOT obscure the model's face or the product."
    )

    return "\n".join(lines)


def generate_branding_prompt(
    category_id: str,
    label: str,
    branding_meta: dict,
) -> str:
    """
    Skilled prompt writer for Gemini branding image generation.

    Args:
        category_id:    Product category key (e.g. 'jewelry').
        label:          Scenario label (e.g. 'Sharma Jewellers — Main').
        branding_meta:  Dict with keys:
                          businessName, phoneNumber, address, webUrl,
                          backgroundColor, backgroundLabel,
                          aspectRatio, aspectRatioDescription
    Returns:
        A rich, multi-section prompt string optimised for Gemini native image generation.
    """

    # ── Extract metadata ──────────────────────────────────────────────────────
    business_name  = branding_meta.get("businessName", "")
    phone_number   = branding_meta.get("phoneNumber", "")
    address        = branding_meta.get("address", "")
    web_url        = branding_meta.get("webUrl", "")
    bg_color       = branding_meta.get("backgroundColor")      # hex string or None
    bg_label       = branding_meta.get("backgroundLabel", "White")
    aspect_ratio   = branding_meta.get("aspectRatio", "4:5")
    ar_description = branding_meta.get("aspectRatioDescription", "Portrait")
    has_logo       = branding_meta.get("hasLogo", False)       # set by route before calling

    # Detect clean variant
    is_clean = "clean" in label.lower()

    # Detect if bg is an image texture (no hex color)
    bg_is_image = not bg_color and "background" in bg_label.lower()

    # ── Look up category style (DB first, fallback to hardcoded) ───────────────
    style_prompt = _DEFAULT_STYLE
    try:
        cat = categories_col.find_one({"category_id": category_id})
        if cat and cat.get("prompts", {}).get("branding"):
            style_prompt = cat["prompts"]["branding"]
        else:
            style_prompt = _CATEGORY_STYLE.get(category_id, _DEFAULT_STYLE)
    except Exception:
        style_prompt = _CATEGORY_STYLE.get(category_id, _DEFAULT_STYLE)

    # ── Compute aspect ratio guidance ─────────────────────────────────────────
    ratio_parts = aspect_ratio.split(":")
    try:
        w, h = int(ratio_parts[0]), int(ratio_parts[1])
        orientation = "portrait (tall)" if h > w else ("landscape (wide)" if w > h else "square")
    except Exception:
        orientation = "portrait (tall)"
        w, h = 4, 5

    # ── Assemble individual sections ──────────────────────────────────────────
    bg_block       = _build_background_block(bg_color, bg_label, bg_is_image)
    branding_block = _build_branding_block(
        is_clean, business_name, phone_number, address, web_url, has_logo
    )

    prompt = f"""
You are an expert commercial photographer and graphic designer.
Your task is to generate a single, complete, print-ready marketing image for:
  Business: {business_name if business_name else "the client"}
  Scenario: {label}

════════════════════════════════════════════════════════
① ART DIRECTION, MOOD & PRODUCT REQUIREMENT
════════════════════════════════════════════════════════
{style_prompt}

The final image should feel like it was shot by a top-tier Indian commercial photographer
for use on Flipkart, Myntra, Amazon, Meesho, or glossy print magazine ads.

════════════════════════════════════════════════════════
② SUBJECT — MODEL / POSE (DO NOT ALTER)
════════════════════════════════════════════════════════
The MODEL POSE image is provided as your reference.
STRICTLY PRESERVE:
  - The model's exact facial structure, skin tone, and expression.
  - The exact body pose, limb positions, and head angle.
  - Clothing (if already on the model) — do not remove or alter existing garments.
  - The model's hair, accessories they're already wearing, and overall appearance.
DO NOT alter the model's face, body proportions, or skin colour under any circumstances.

════════════════════════════════════════════════════════
③ PRODUCT INTEGRATION
════════════════════════════════════════════════════════
The PRODUCT image is provided separately. Your task:
  • Extract the product cleanly from its source image.
  • Place the product naturally on or near the model as it would be worn/held/used.
  • Match the product's scale perfectly to the model's body proportions.
  • Ensure photorealistic integration:
    - Cast soft, directional shadows from the product onto the model/surface.
    - Apply correct light reflection on the product surface from the scene lighting.
    - Product edges must be sharp and clean — no halos, no rough cutouts.
    - Maintain the product's original colours, textures, patterns, and materials exactly.

════════════════════════════════════════════════════════
④ {bg_block}
════════════════════════════════════════════════════════

════════════════════════════════════════════════════════
⑤ {branding_block}
════════════════════════════════════════════════════════

════════════════════════════════════════════════════════
⑥ COMPOSITION — {aspect_ratio} ({ar_description})
════════════════════════════════════════════════════════
  • Final output aspect ratio: {aspect_ratio} ({orientation}).
  • Apply the rule-of-thirds: place the model/product at an intersection point.
  • Keep the model's face and product in the upper ⅔ of the frame (safe from branding strip).
  • Maintain a visual breathing space (padding) of ~5% on all sides.
  • The composition should immediately draw the viewer's eye to the PRODUCT first,
    then to the model's face, then to the branding strip.
  • For {ar_description} format — ensure the image looks native to this platform.

════════════════════════════════════════════════════════
⑦ TECHNICAL QUALITY REQUIREMENTS
════════════════════════════════════════════════════════
  • Resolution: render at the highest quality — no pixelation, no compression artefacts.
  • Skin retouching: smooth but natural — avoid over-processed, plastic-looking skin.
  • Product clarity: the product should be the sharpest element in the frame.
  • Colour accuracy: all product colours must match the input product image exactly.
  • Depth of field: slight background defocus if appropriate to the genre; product must be sharp.
  • No chromatic aberration, no lens distortion.
  • The image must pass quality review for e-commerce listing on major Indian platforms.

════════════════════════════════════════════════════════
⑧ ABSOLUTE PROHIBITIONS (NEVER DO THESE)
════════════════════════════════════════════════════════
  ✗ Do NOT change the model's face, skin tone, body shape, or pose.
  ✗ Do NOT add speech bubbles, sale badges, discount stickers, or unbranded text.
  ✗ Do NOT produce a collage, split-view, or multi-panel image.
  ✗ Do NOT add watermarks unless they are part of the branding spec above.
  ✗ Do NOT blur or distort the product.
  ✗ Do NOT crop the product out of the frame.
  ✗ Do NOT alter the product's colour, texture, or material appearance.
  ✗ Do NOT add extra people, animals, or objects not in the source images.
  ✗ Do NOT produce a sketched, illustrated, cartoon, or anime-style image.
  ✗ Output exactly ONE complete, full-frame image — nothing else.

Generate the final image now.
""".strip()

    return prompt
