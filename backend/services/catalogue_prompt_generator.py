"""
Catalogue Prompt Generator - Highly accurate prompts for catalogue image generation
Maintains original model poses/styles while adding appropriate context and backgrounds
"""
from database import categories_col

# Category ID mapping (frontend IDs → catalogue prompt keys)
_CATEGORY_KEY_MAP = {
    "jewelry": "jewelry",
    "fashion": "clothing",
    "home": "home_decor",
    "kitchen": "kitchen_dining",
    "electronics": "electronics",
    "beauty": "beauty_cosmetics",
    "sports": "sports_fitness",
}


def _build_background_block(bg_color: str | None, bg_label: str) -> str:
    """Build background instruction block for catalogue prompts"""
    if bg_color:
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


def _generate_catalogue_prompt_hardcoded(category_id: str, model_pose: str, product_description: str = "", bg_color: str = None, bg_label: str = "White") -> str:
    """
    Generate highly accurate prompts for catalogue images based on category
    Maintains the original model pose/style (side view, back view, etc.) without changes
    """
    
    # Build background block
    bg_block = _build_background_block(bg_color, bg_label)
    
    category_prompts = {
        # Jewelry Category
        "jewelry": f"""
        Create a professional product catalogue image featuring a model wearing traditional Indian jewelry.
        
        MODEL REQUIREMENTS:
        - Model must be wearing an elegant saree with perfect draping
        - Hair should be perfectly styled in a traditional Indian updo with jewelry accessories
        - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
        - Model should have graceful, elegant posture suitable for jewelry showcase
        
        {bg_block}
        
        PRODUCT REQUIREMENTS:
        - The jewelry should be clearly visible and properly displayed
        - Focus on the craftsmanship and details of the jewelry pieces
        - Proper lighting to highlight the metal work and gemstones
        
        STYLE REQUIREMENTS:
        - High-end luxury jewelry catalogue aesthetic
        - Professional photography with sharp focus
        - Rich color saturation to bring out gold and gemstone colors
        - Editorial quality suitable for premium jewelry brands
        
        STRICT NOTES:
        - DO NOT alter the {model_pose} - maintain exact same angle and pose
        - DO NOT change model position or orientation
        - Focus on enhancing the scene while preserving the original pose
        - Ensure jewelry remains the primary focus
        """,
        
        # Clothing Category
        "clothing": f"""
        Create a stunning fashion catalogue image showcasing apparel in an aesthetic destination setting.
        
        MODEL REQUIREMENTS:
        - Model should have perfectly styled hair appropriate to the garment
        - Makeup should be professional and complement the clothing
        - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
        - Model posture should be confident and fashion-forward
        
        BACKGROUND REQUIREMENTS:
        - Breathtaking aesthetic destination: Parisian streets, Santorini blue domes, Japanese gardens, or Moroccan riads
        - Architectural elements that complement the clothing style
        - Natural golden hour lighting for dreamy, aspirational feel
        - Environmental elements that enhance the fashion story
        
        PRODUCT REQUIREMENTS:
        - Clothing should be perfectly fitted and showcased
        - Fabric texture and details should be clearly visible
        - Color accuracy is crucial for the garments
        
        STYLE REQUIREMENTS:
        - High fashion magazine editorial quality
        - Sophisticated, aspirational aesthetic
        - Professional fashion photography standards
        - Luxury brand catalogue style
        
        STRICT NOTES:
        - DO NOT alter the {model_pose} - maintain exact same angle and pose
        - DO NOT change model position or orientation
        - Focus on enhancing the scene while preserving the original pose
        - Clothing must remain the primary focus
        """,
        
        # Home Decor Category
        "home_decor": f"""
        Create an elegant home decor catalogue image showcasing products in a luxurious setting.
        
        MODEL REQUIREMENTS:
        - Model should be positioned naturally within the home environment
        - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
        - Model should appear relaxed and at home in the luxury setting
        
        BACKGROUND REQUIREMENTS:
        - Rich, sophisticated house with high-end interior design
        - Premium materials: marble floors, silk draperies, designer furniture
        - Elegant lighting with chandeliers or designer fixtures
        - Architectural details like crown molding, hardwood floors, or feature walls
        
        PRODUCT REQUIREMENTS:
        - Home decor items should be prominently displayed
        - Products should look integrated into the luxury environment
        - Focus on craftsmanship and quality of materials
        
        STYLE REQUIREMENTS:
        - Luxury interior magazine aesthetic
        - High-end real estate photography quality
        - Sophisticated, aspirational home environment
        - Premium home decor catalogue style
        
        STRICT NOTES:
        - DO NOT alter the {model_pose} - maintain exact same angle and pose
        - DO NOT change model position or orientation
        - Focus on enhancing the scene while preserving the original pose
        - Home decor products must remain clearly visible
        """,
        
        # Kitchen & Dining Category
        "kitchen_dining": f"""
        Create an appetizing kitchen and dining catalogue image showcasing products in a gourmet setting.
        
        MODEL REQUIREMENTS:
        - Model should appear as a sophisticated home chef or host
        - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
        - Model should look comfortable and confident in the kitchen environment
        
        BACKGROUND REQUIREMENTS:
        - Professional gourmet kitchen with high-end appliances
        - Marble countertops, custom cabinetry, premium fixtures
        - Warm, inviting lighting suitable for food photography
        - Organized, clean kitchen with designer touches
        
        PRODUCT REQUIREMENTS:
        - Kitchen/dining products should be clearly visible and in use
        - Food presentation should be appetizing and professional
        - Focus on product functionality and aesthetic appeal
        
        STYLE REQUIREMENTS:
        - Premium cooking magazine aesthetic
        - Professional food photography standards
        - Gourmet lifestyle catalog quality
        - High-end kitchen show room style
        
        STRICT NOTES:
        - DO NOT alter the {model_pose} - maintain exact same angle and pose
        - DO NOT change model position or orientation
        - Focus on enhancing the scene while preserving the original pose
        - Kitchen/dining products must remain the primary focus
        """,
        
        # Electronics Category
        "electronics": f"""
        Create a sleek electronics catalogue image showcasing products in a modern tech environment.
        
        MODEL REQUIREMENTS:
        - Model should appear tech-savvy and sophisticated
        - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
        - Model should interact naturally with electronic devices
        
        BACKGROUND REQUIREMENTS:
        - Modern, minimalist environment with clean lines
        - High-tech setting: smart home, modern office, or futuristic space
        - Professional lighting suitable for product photography
        - Clean, uncluttered background that highlights technology
        
        PRODUCT REQUIREMENTS:
        - Electronic products should be clearly visible and properly displayed
        - Screens should show appealing content
        - Focus on product design, features, and build quality
        
        STYLE REQUIREMENTS:
        - High-tech product photography aesthetic
        - Modern, clean, minimalist design
        - Professional electronics catalogue quality
        - Premium tech brand style
        
        STRICT NOTES:
        - DO NOT alter the {model_pose} - maintain exact same angle and pose
        - DO NOT change model position or orientation
        - Focus on enhancing the scene while preserving the original pose
        - Electronic products must remain the primary focus
        """,
        
        # Beauty & Cosmetics Category
        "beauty_cosmetics": f"""
        Create a glamorous beauty and cosmetics catalogue image with a DIY aesthetic.
        
        MODEL REQUIREMENTS:
        - Model should have flawless, professional makeup application
        - Hair should be perfectly styled and maintained
        - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
        - Model should appear confident and beautiful
        
        BACKGROUND REQUIREMENTS:
        - Modern vanity or beauty station setup
        - Professional lighting suitable for beauty photography
        - Clean, organized beauty product arrangement
        - Elegant, feminine color palette
        
        PRODUCT REQUIREMENTS:
        - Beauty products should be clearly visible and attractively arranged
        - Focus on product packaging, colors, and textures
        - Products should look premium and high-quality
        
        STYLE REQUIREMENTS:
        - Professional beauty magazine aesthetic
        - High-end cosmetics catalogue quality
        - Glamorous, aspirational beauty style
        - DIY beauty tutorial inspiration
        
        STRICT NOTES:
        - DO NOT alter the {model_pose} - maintain exact same angle and pose
        - DO NOT change model position or orientation
        - Focus on enhancing the scene while preserving the original pose
        - Beauty products must remain the primary focus
        """,
        
        # Sports & Fitness Category
        "sports_fitness": f"""
        Create an energetic sports and fitness catalogue image with a motivational DIY approach.
        
        MODEL REQUIREMENTS:
        - Model should appear athletic and fit
        - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
        - Model should look motivated and energetic
        
        BACKGROUND REQUIREMENTS:
        - Modern gym or outdoor fitness setting
        - Professional fitness environment with quality equipment
        - Dynamic lighting that enhances the athletic aesthetic
        - Clean, motivating fitness atmosphere
        
        PRODUCT REQUIREMENTS:
        - Sports/fitness products should be clearly visible
        - Equipment should look professional and high-quality
        - Focus on product functionality and durability
        
        STYLE REQUIREMENTS:
        - Professional fitness magazine aesthetic
        - High-energy sports photography quality
        - Motivational fitness catalog style
        - DIY fitness inspiration approach
        
        STRICT NOTES:
        - DO NOT alter the {model_pose} - maintain exact same angle and pose
        - DO NOT change model position or orientation
        - Focus on enhancing the scene while preserving the original pose
        - Sports/fitness products must remain the primary focus
        """
    }
    
    # Default prompt if category not found
    default_prompt = f"""
    Create a professional product catalogue image showcasing the product with the model.
    
    MODEL REQUIREMENTS:
    - Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
    - Model should appear professional and appropriate for the product
    
    BACKGROUND REQUIREMENTS:
    - Professional, clean background suitable for product photography
    - Proper lighting to highlight both model and product
    - Environment that enhances the product presentation
    
    PRODUCT REQUIREMENTS:
    - Product should be clearly visible and properly displayed
    - Focus on product features and quality
    
    STYLE REQUIREMENTS:
    - Professional catalogue photography quality
    - Clean, commercial aesthetic
    - High-end product presentation
    
    STRICT NOTES:
    - DO NOT alter the {model_pose} - maintain exact same angle and pose
    - DO NOT change model position or orientation
    - Product must remain the primary focus
    """
    
    return category_prompts.get(category_id.lower(), default_prompt).strip()


def get_category_specific_requirements(category_id: str) -> dict:
    """
    Get category-specific requirements for catalogue generation
    """
    requirements = {
        "jewelry": {
            "key_elements": ["saree", "traditional hairstyle", "wedding/temple background"],
            "lighting": "warm golden lighting",
            "focus": "jewelry craftsmanship and details"
        },
        "clothing": {
            "key_elements": ["perfect hair", "aesthetic destination", "fashion posture"],
            "lighting": "golden hour natural lighting",
            "focus": "clothing fit and fabric details"
        },
        "home_decor": {
            "key_elements": ["luxury house", "premium materials", "elegant posture"],
            "lighting": "sophisticated interior lighting",
            "focus": "product integration in luxury environment"
        },
        "kitchen_dining": {
            "key_elements": ["gourmet kitchen", "professional setup", "chef posture"],
            "lighting": "warm kitchen lighting",
            "focus": "product functionality and food presentation"
        },
        "electronics": {
            "key_elements": ["modern tech environment", "clean lines", "tech-savvy posture"],
            "lighting": "professional tech lighting",
            "focus": "product design and features"
        },
        "beauty_cosmetics": {
            "key_elements": ["flawless makeup", "vanity setup", "glamorous posture"],
            "lighting": "professional beauty lighting",
            "focus": "product colors and packaging"
        },
        "sports_fitness": {
            "key_elements": ["athletic posture", "fitness environment", "energetic setup"],
            "lighting": "dynamic fitness lighting",
            "focus": "product durability and functionality"
        }
    }
    
    return requirements.get(category_id.lower(), {
        "key_elements": ["professional setup", "appropriate posture"],
        "lighting": "professional lighting",
        "focus": "product presentation"
    })


def generate_catalogue_prompt(category_id: str, model_pose: str, product_description: str = "", bg_color: str = None, bg_label: str = "White") -> str:
    """
    Public API: try DB first, fallback to hardcoded prompts.
    The DB stores templates with {model_pose} and {bg_block} placeholders.
    """
    bg_block = _build_background_block(bg_color, bg_label)
    
    try:
        cat = categories_col.find_one({"category_id": category_id})
        if cat and cat.get("prompts", {}).get("catalogue"):
            template = cat["prompts"]["catalogue"]
            return template.replace("{model_pose}", model_pose).replace("{bg_block}", bg_block).strip()
    except Exception as e:
        print(f"⚠ DB catalogue prompt fetch failed, using fallback: {e}")

    # Map frontend category_id to catalogue prompt key
    mapped_id = _CATEGORY_KEY_MAP.get(category_id, category_id)
    return _generate_catalogue_prompt_hardcoded(mapped_id, model_pose, product_description, bg_color, bg_label)
