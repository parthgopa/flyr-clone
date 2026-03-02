from prompts import (
    SYSTEM_PROMPT,
    JEWELRY_PROMPT,
    FASHION_PROMPT,
    HOME_PROMPT,
    ACCESSORIES_PROMPT,
    BEAUTY_PROMPT,
    ELECTRONICS_PROMPT,
    KIDS_PROMPT,
    ART_PROMPT,
    FOOD_PROMPT,
    QUALITY_PROMPT
)
from database import categories_col, prompt_templates_col

# Hardcoded fallback map
_FALLBACK_CATEGORY_PROMPT_MAP = {
    "jewelry": JEWELRY_PROMPT,
    "fashion": FASHION_PROMPT,
    "home": HOME_PROMPT,
    "kitchen": HOME_PROMPT,
    "electronics": ELECTRONICS_PROMPT,
    "beauty": BEAUTY_PROMPT,
    "sports": FASHION_PROMPT,
}


def _get_system_prompt() -> str:
    """Fetch system prompt from DB, fallback to hardcoded."""
    try:
        doc = prompt_templates_col.find_one({"template_id": "system_prompt", "is_active": True})
        if doc and doc.get("content"):
            return doc["content"]
    except Exception:
        pass
    return SYSTEM_PROMPT


def _get_quality_prompt() -> str:
    """Fetch quality prompt from DB, fallback to hardcoded."""
    try:
        doc = prompt_templates_col.find_one({"template_id": "quality_prompt", "is_active": True})
        if doc and doc.get("content"):
            return doc["content"]
    except Exception:
        pass
    return QUALITY_PROMPT


def _get_category_prompt(category_id: str) -> str:
    """Fetch category shoot prompt from DB, fallback to hardcoded."""
    try:
        cat = categories_col.find_one({"category_id": category_id})
        if cat and cat.get("prompts", {}).get("shoot"):
            return cat["prompts"]["shoot"]
    except Exception:
        pass
    return _FALLBACK_CATEGORY_PROMPT_MAP.get(category_id, "")


def build_prompt(category_id: str, scenario_hint: str = "") -> str:
    """Build the full prompt for a single scenario generation."""
    scenario_section = ""
    if scenario_hint:
        scenario_section = f"""
SCENARIO CONTEXT:
{scenario_hint}
Generate the image specifically for this scenario. The background, lighting, and mood
must match the described scenario while keeping the product and person realistic.
"""
    return f"""
{_get_category_prompt(category_id)}
{scenario_section}
"""

