"""
Seed script — populates MongoDB with categories, models, backgrounds, and prompts.

Run once:  python seed_data.py
Re-running is safe: existing data is dropped and re-inserted.

All images from the React Native `assets/` folder are copied into
`backend/uploads/seed/` so they can be served via the static file route.
"""

import os
import shutil
from datetime import datetime
from database import (
    categories_col,
    app_models_col,
    branding_bg_col,
    prompt_templates_col,
)

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "..", "assets")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "seed")


def _ensure_dirs():
    """Create upload sub-directories."""
    for sub in ("models", "catalogue", "branding-poses", "backgrounds", "showcase"):
        os.makedirs(os.path.join(UPLOAD_DIR, sub), exist_ok=True)


def _copy(src_rel: str, dest_sub: str, dest_name: str = None) -> str:
    """Copy an asset file into uploads/seed/<dest_sub>/ and return the URL path."""
    src = os.path.join(ASSETS_DIR, src_rel)
    fname = dest_name or os.path.basename(src_rel)
    dst = os.path.join(UPLOAD_DIR, dest_sub, fname)
    if os.path.exists(src):
        shutil.copy2(src, dst)
    url = f"uploads/seed/{dest_sub}/{fname}"
    return url


# ═══════════════════════════════════════════════════════════════════════════════
# 1. CATEGORIES  (with scenarios + showcase items + prompts)
# ═══════════════════════════════════════════════════════════════════════════════

def _seed_categories():
    categories_col.drop()
    now = datetime.utcnow()

    # Showcase images (before / after) — shared placeholders for now
    j_before = _copy("jewelry.jpg", "showcase", "jewelry_before.jpg")
    j_after_shoot = _copy("jewelery_shoot.png", "showcase", "jewelry_after_shoot.png")
    j_after_dia = _copy("diamond.webp", "showcase", "jewelry_after_diamond.webp")

    cats = [
        # ── Jewelry ───────────────────────────────────────────────────────────
        {
            "category_id": "jewelry",
            "title": "Jewelry",
            "icon": "diamond",
            "is_active": True,
            "order": 1,
            "subcategories": ["photoshoot", "catalogue", "branding"],
            "showcase_items": {
                "photoshoot": [
                    {"id": "j_ps1", "before_url": j_before, "after_url": j_after_shoot},
                    {"id": "j_ps2", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "j_ps3", "before_url": j_before, "after_url": j_after_dia},
                ],
                "catalogue": [
                    {"id": "j_cat1", "thumbnails": [
                        {"label": "Side View", "image_url": j_before},
                        {"label": "Sitting", "image_url": j_before},
                        {"label": "Product View", "image_url": j_before},
                        {"label": "Key Highlights", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                    {"id": "j_cat2", "thumbnails": [
                        {"label": "Side View", "image_url": j_before},
                        {"label": "Sitting", "image_url": j_before},
                        {"label": "Product View", "image_url": j_before},
                        {"label": "Key Highlights", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                ],
                "branding": [
                    {"id": "j_br1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "j_br2", "before_url": j_before, "after_url": j_after_dia},
                ],
            },
            "scenarios": [
                {"id": "temple", "label": "Temple Visit", "is_active": True,
                 "prompt_hint": "The person is visiting a grand traditional temple. Warm golden ambient light, ornate architecture in the background. The jewelry should complement the traditional, spiritual setting."},
                {"id": "party", "label": "Party Look", "is_active": False,
                 "prompt_hint": "The person is at an elegant evening party or cocktail event. Glamorous indoor lighting with bokeh, stylish decor in the background. The jewelry should sparkle under party lights."},
                {"id": "wedding", "label": "Wedding", "is_active": False,
                 "prompt_hint": "The person is at a beautiful wedding ceremony. Soft romantic lighting, floral decorations, luxurious venue. The jewelry should look bridal and elegant."},
            ],
            "prompts": {
                "shoot": "Place the jewelry item naturally on the model.\n\nRules:\n- Correct anatomical placement (neck, ears, wrists, fingers)\n- Realistic metallic reflections (gold, silver, diamond)\n- Soft studio lighting with subtle highlights\n- Accurate scale relative to the body\n- Natural skin contact and shadows\n\nStyle:\nLuxury jewelry photoshoot, ultra-high realism.",
                "catalogue": """Create a professional product catalogue image featuring a model wearing traditional Indian jewelry.

MODEL REQUIREMENTS:
- Model must be wearing an elegant saree with perfect draping
- Hair should be perfectly styled in a traditional Indian updo with jewelry accessories
- Maintain the exact {model_pose} pose - DO NOT change the angle or positioning
- Model should have graceful, elegant posture suitable for jewelry showcase

BACKGROUND REQUIREMENTS:
- Authentic Indian wedding hall or ancient temple setting
- Rich architectural elements with intricate carvings
- Soft, warm golden lighting reminiscent of wedding ceremonies
- Traditional Indian decor elements like marigold flowers, diyas, or mandap patterns

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
- Ensure jewelry remains the primary focus""",
                "branding": "Luxury jewelry editorial. Soft, directional studio lighting with subtle rim light to make metals and gems sparkle. Elegant, timeless, aspirational mood. The jewelry should glint with realistic light reflection and refraction. The model is wearing the jewelry naturally; skin tone and facial features are pristine.",
            },
            "created_at": now,
            "updated_at": now,
        },
        # ── Fashion ───────────────────────────────────────────────────────────
        {
            "category_id": "fashion",
            "title": "Fashion & Clothing",
            "icon": "shirt",
            "is_active": True,
            "order": 2,
            "subcategories": ["photoshoot", "catalogue", "branding"],
            "showcase_items": {
                "photoshoot": [
                    {"id": "f_ps1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "f_ps2", "before_url": j_before, "after_url": j_after_dia},
                ],
                "catalogue": [
                    {"id": "f_cat1", "thumbnails": [
                        {"label": "Side View", "image_url": j_before},
                        {"label": "Sitting", "image_url": j_before},
                        {"label": "Product View", "image_url": j_before},
                        {"label": "Back View", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                    {"id": "f_cat2", "thumbnails": [
                        {"label": "Side View", "image_url": j_before},
                        {"label": "Sitting", "image_url": j_before},
                        {"label": "Product View", "image_url": j_before},
                        {"label": "Back View", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                ],
                "branding": [
                    {"id": "f_br1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "f_br2", "before_url": j_before, "after_url": j_after_dia},
                ],
            },
            "scenarios": [
                {"id": "travel", "label": "Travel", "is_active": True,
                 "prompt_hint": "The person is traveling at a scenic destination — airport lounge, train station, or iconic landmark. The outfit should look travel-ready, comfortable yet stylish. Natural daylight."},
                {"id": "destination", "label": "Destination", "is_active": False,
                 "prompt_hint": "The person is at a beautiful vacation destination — beach resort, mountain view, or European street. The clothing should suit the destination vibe. Golden-hour lighting."},
                {"id": "casual", "label": "Casual Day", "is_active": False,
                 "prompt_hint": "The person is in a casual everyday setting — coffee shop, park, or city sidewalk. Relaxed, natural pose. Soft natural lighting. The outfit should look effortlessly stylish."},
            ],
            "prompts": {
                "shoot": "Dress the model with the uploaded clothing item.\n\nRules:\n- Preserve fabric texture and weave\n- Natural fabric folds and draping\n- Correct body alignment and proportions\n- No distortion of arms, legs, or torso\n- Outfit should look worn, not pasted\n\nStyle:\nHigh-end fashion editorial photography.",
                "catalogue": """Create a stunning fashion catalogue image showcasing apparel in an aesthetic destination setting.

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
- Clothing must remain the primary focus""",
                "branding": "High-fashion lifestyle editorial. Studio-grade three-point lighting; bright, clean whites. Confident, stylish, contemporary mood. Clothing drapes naturally on the body with correct folds, creases, and texture. The model is posed confidently; outfit fits perfectly with no distortion.",
            },
            "created_at": now,
            "updated_at": now,
        },
        # ── Home Decor ────────────────────────────────────────────────────────
        {
            "category_id": "home",
            "title": "Home Decor",
            "icon": "home",
            "is_active": True,
            "order": 3,
            "subcategories": ["photoshoot", "catalogue", "branding"],
            "showcase_items": {
                "photoshoot": [
                    {"id": "h_ps1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "h_ps2", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "h_ps3", "before_url": j_before, "after_url": j_after_dia},
                ],
                "catalogue": [
                    {"id": "h_cat1", "thumbnails": [
                        {"label": "Front View", "image_url": j_before},
                        {"label": "Side View", "image_url": j_before},
                        {"label": "Detail Shot", "image_url": j_before},
                        {"label": "Room Context", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                ],
                "branding": [
                    {"id": "h_br1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "h_br2", "before_url": j_before, "after_url": j_after_dia},
                ],
            },
            "scenarios": [
                {"id": "living_room", "label": "Living Room", "is_active": True,
                 "prompt_hint": "A person is sitting or standing in a modern living room alongside the uploaded home decor product. Warm ambient interior lighting, cozy atmosphere. The product should be naturally placed in the room."},
                {"id": "bedroom", "label": "Bedroom", "is_active": True,
                 "prompt_hint": "A person is in a well-decorated bedroom with the uploaded home decor product. Soft warm lighting, comfortable setting. The product blends naturally into the bedroom interior."},
            ],
            "prompts": {
                "shoot": "Place the product in a realistic home environment.\n\nRules:\n- Correct perspective and scale\n- Natural ambient lighting\n- Interior design realism\n- Product should blend naturally into the scene\n\nStyle:\nModern interior design photography.",
                "catalogue": """Create an elegant home decor catalogue image showcasing products in a luxurious setting.

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
- Home decor products must remain clearly visible""",
                "branding": "Premium interior / lifestyle product photography. Warm, diffused natural window light from one side. Warm, inviting, aspirational domestic aesthetic. The home product should look as if it naturally belongs in the scene. The model interacts naturally with the environment.",
            },
            "created_at": now,
            "updated_at": now,
        },
        # ── Kitchen & Dining ──────────────────────────────────────────────────
        {
            "category_id": "kitchen",
            "title": "Kitchen & Dining",
            "icon": "restaurant",
            "is_active": True,
            "order": 4,
            "subcategories": ["photoshoot", "catalogue", "branding"],
            "showcase_items": {
                "photoshoot": [
                    {"id": "k_ps1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "k_ps2", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "k_ps3", "before_url": j_before, "after_url": j_after_dia},
                ],
                "catalogue": [
                    {"id": "k_cat1", "thumbnails": [
                        {"label": "Top View", "image_url": j_before},
                        {"label": "Side View", "image_url": j_before},
                        {"label": "In Use", "image_url": j_before},
                        {"label": "Features", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                ],
                "branding": [
                    {"id": "k_br1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "k_br2", "before_url": j_before, "after_url": j_after_dia},
                ],
            },
            "scenarios": [
                {"id": "modern_kitchen", "label": "Modern Kitchen", "is_active": True,
                 "prompt_hint": "The product is placed in a sleek modern kitchen with clean countertops, stainless steel appliances, and bright overhead lighting. A person is using or standing near the product naturally."},
                {"id": "dining_table", "label": "Dining Setup", "is_active": True,
                 "prompt_hint": "The product is arranged on a beautifully set dining table. Warm candlelight or pendant lighting, elegant tableware. A person is seated at or near the table."},
            ],
            "prompts": {
                "shoot": "Place the product in a realistic home environment.\n\nRules:\n- Correct perspective and scale\n- Natural ambient lighting\n- Interior design realism\n- Product should blend naturally into the scene\n\nStyle:\nModern interior design photography.",
                "catalogue": """Create an appetizing kitchen and dining catalogue image showcasing products in a gourmet setting.

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
- Kitchen/dining products must remain the primary focus""",
                "branding": "Food & kitchenware lifestyle photography. Bright, clean overhead and side lighting; true-to-life colors. Fresh, clean, appetizing, modern kitchen feel. Kitchen items should look practical and premium; surfaces must appear clean. The model uses the product naturally.",
            },
            "created_at": now,
            "updated_at": now,
        },
        # ── Electronics ───────────────────────────────────────────────────────
        {
            "category_id": "electronics",
            "title": "Electronics",
            "icon": "phone-portrait",
            "is_active": True,
            "order": 5,
            "subcategories": ["photoshoot", "catalogue", "branding"],
            "showcase_items": {
                "photoshoot": [
                    {"id": "e_ps1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "e_ps2", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "e_ps3", "before_url": j_before, "after_url": j_after_dia},
                ],
                "catalogue": [
                    {"id": "e_cat1", "thumbnails": [
                        {"label": "Front View", "image_url": j_before},
                        {"label": "Back View", "image_url": j_before},
                        {"label": "Screen On", "image_url": j_before},
                        {"label": "Ports", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                ],
                "branding": [
                    {"id": "e_br1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "e_br2", "before_url": j_before, "after_url": j_after_dia},
                ],
            },
            "scenarios": [
                {"id": "desk_setup", "label": "Desk Setup", "is_active": True,
                 "prompt_hint": "The electronic product is placed on a clean modern desk setup. Ambient LED lighting, minimalist workspace. A person is using or interacting with the product."},
                {"id": "outdoor", "label": "On the Go", "is_active": False,
                 "prompt_hint": "A person is using the electronic product outdoors — park bench, café terrace, or urban street. Natural daylight, lifestyle photography feel."},
                {"id": "cozy_home", "label": "Cozy Home", "is_active": False,
                 "prompt_hint": "A person is using the electronic product in a cozy home environment — sofa, bed, or reading nook. Warm soft lighting, relaxed atmosphere."},
            ],
            "prompts": {
                "shoot": "Place the electronic product in a clean lifestyle setup.\n\nRules:\n- Sharp edges and details\n- Accurate reflections on glass and metal\n- No distortion of screen or buttons\n\nStyle:\nModern tech product photography.",
                "catalogue": """Create a sleek electronics catalogue image showcasing products in a modern tech environment.

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
- Electronic products must remain the primary focus""",
                "branding": "Tech product advertising photography. Cool, crisp studio lighting; sharp reflections on glass and metal surfaces. Sleek, cutting-edge, innovative mood. Screens should appear with accurate color reproduction; device surfaces pristine. The model uses the tech naturally, conveying ease of use.",
            },
            "created_at": now,
            "updated_at": now,
        },
        # ── Beauty & Cosmetics ────────────────────────────────────────────────
        {
            "category_id": "beauty",
            "title": "Beauty & Cosmetics",
            "icon": "color-palette",
            "is_active": True,
            "order": 6,
            "subcategories": ["photoshoot", "catalogue", "branding"],
            "showcase_items": {
                "photoshoot": [
                    {"id": "b_ps1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "b_ps2", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "b_ps3", "before_url": j_before, "after_url": j_after_dia},
                ],
                "catalogue": [
                    {"id": "b_cat1", "thumbnails": [
                        {"label": "Product Shot", "image_url": j_before},
                        {"label": "Swatch", "image_url": j_before},
                        {"label": "In Use", "image_url": j_before},
                        {"label": "Ingredients", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                ],
                "branding": [
                    {"id": "b_br1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "b_br2", "before_url": j_before, "after_url": j_after_dia},
                ],
            },
            "scenarios": [
                {"id": "vanity", "label": "Vanity Mirror", "is_active": True,
                 "prompt_hint": "The person is applying or showcasing the beauty product at a vanity mirror setup. Soft ring-light illumination, clean beauty station. Professional makeup look."},
                {"id": "outdoor_glow", "label": "Outdoor Glow", "is_active": True,
                 "prompt_hint": "The person is outdoors in golden-hour sunlight, showcasing the beauty product with a natural radiant glow. Garden, rooftop, or beach setting."},
                {"id": "night_out", "label": "Night Out", "is_active": True,
                 "prompt_hint": "The person is ready for a night out, showcasing the beauty product under dramatic evening lighting. Glamorous background, city lights or upscale venue."},
            ],
            "prompts": {
                "shoot": "Apply the beauty product subtly on the model.\n\nRules:\n- Natural skin texture\n- No exaggerated makeup\n- Clean and professional lighting\n- Realistic cosmetic finish\n\nStyle:\nProfessional beauty campaign photography.",
                "catalogue": """Create a glamorous beauty and cosmetics catalogue image with a DIY aesthetic.

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
- Beauty products must remain the primary focus""",
                "branding": "Beauty & cosmetics editorial. Soft beauty lighting — large softbox or ring light; flawless skin rendering. Glowing, fresh, radiant, luxurious mood. Cosmetic product packaging must be clearly visible and pristine. The models skin, makeup, and expression are flawless and editorial-grade.",
            },
            "created_at": now,
            "updated_at": now,
        },
        # ── Sports & Fitness ──────────────────────────────────────────────────
        {
            "category_id": "sports",
            "title": "Sports & Fitness",
            "icon": "fitness",
            "is_active": True,
            "order": 7,
            "subcategories": ["photoshoot", "catalogue", "branding"],
            "showcase_items": {
                "photoshoot": [
                    {"id": "s_ps1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "s_ps2", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "s_ps3", "before_url": j_before, "after_url": j_after_dia},
                ],
                "catalogue": [
                    {"id": "s_cat1", "thumbnails": [
                        {"label": "Action Shot", "image_url": j_before},
                        {"label": "Side View", "image_url": j_before},
                        {"label": "Detail", "image_url": j_before},
                        {"label": "Features", "image_url": j_after_dia},
                        {"label": "Before", "image_url": j_before},
                    ]},
                ],
                "branding": [
                    {"id": "s_br1", "before_url": j_before, "after_url": j_after_dia},
                    {"id": "s_br2", "before_url": j_before, "after_url": j_after_dia},
                ],
            },
            "scenarios": [
                {"id": "outdoor_run", "label": "Outdoor Run", "is_active": True,
                 "prompt_hint": "The person is running or jogging outdoors on a trail, park, or city street with the sports product. Morning light, active and energetic pose."},
                {"id": "gym", "label": "At the Gym", "is_active": False,
                 "prompt_hint": "The person is at a modern gym, wearing or using the sports product. Energetic atmosphere, gym equipment in background. Dynamic lighting."},
                {"id": "yoga", "label": "Yoga & Wellness", "is_active": False,
                 "prompt_hint": "The person is in a calm yoga or wellness setting — studio, garden, or beach. Wearing or using the sports product. Peaceful, serene atmosphere with soft natural light."},
            ],
            "prompts": {
                "shoot": "Dress the model with the uploaded clothing item.\n\nRules:\n- Preserve fabric texture and weave\n- Natural fabric folds and draping\n- Correct body alignment and proportions\n- No distortion of arms, legs, or torso\n- Outfit should look worn, not pasted\n\nStyle:\nHigh-end fashion editorial photography.",
                "catalogue": """Create an energetic sports and fitness catalogue image with a motivational DIY approach.

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
- Sports/fitness products must remain the primary focus""",
                "branding": "Sports & activewear performance photography. High-key studio lighting; sharp, energetic feel. Dynamic, powerful, athletic, motivational mood. Product appears functional and performance-oriented; no wrinkles unless intentional. The model conveys energy, strength, or motion even in a static pose.",
            },
            "created_at": now,
            "updated_at": now,
        },
    ]

    categories_col.insert_many(cats)
    print(f"✅ Seeded {len(cats)} categories")


# ═══════════════════════════════════════════════════════════════════════════════
# 2. APP MODELS  (photoshoot + catalogue + branding)
# ═══════════════════════════════════════════════════════════════════════════════

def _build_catalogue_photos(prefix: str, asset_dir: str) -> list:
    """Build catalogue photo list and copy images."""
    poses = [
        ("3-4", "3/4 View", "model"),
        ("away", "Away View", "model"),
        ("back", "Back View", "model"),
        ("chair", "Chair Pose", "model"),
        ("closeup", "Close-up", "model"),
        ("hips", "Hips View", "model"),
        ("side", "Side View", "model"),
        ("stand", "Standing", "model"),
        ("walk", "Walking", "model"),
        ("product", "Product", "studio"),
        ("magic", "Magic View", "studio"),
        ("with-model", "With Model", "highlight"),
        ("without-model", "Without Model", "highlight"),
    ]
    photos = []
    for suffix, label, ptype in poses:
        fname = f"{prefix}-{suffix}.png"
        src_path = f"{asset_dir}/{fname}"
        url = _copy(src_path, "catalogue", fname)
        photos.append({
            "id": f"{prefix}-{suffix}",
            "image_url": url,
            "type": ptype,
            "label": label,
        })
    return photos


def _build_branding_poses(prefix: str, asset_dir: str, id_prefix: str) -> list:
    """Build branding pose list and copy images."""
    poses = [
        ("stand", "Standing"),
        ("3-4", "3/4 View"),
        ("side", "Side View"),
        ("closeup", "Close-up"),
        ("hips", "Hips View"),
        ("back", "Back View"),
    ]
    result = []
    for suffix, label in poses:
        fname = f"{prefix}-{suffix}.png"
        src_path = f"{asset_dir}/{fname}"
        url = _copy(src_path, "branding-poses", fname)
        result.append({
            "id": f"{id_prefix}-{suffix}",
            "image_url": url,
            "label": label,
        })
    return result


def _seed_models():
    app_models_col.drop()
    now = datetime.utcnow()
    docs = []

    # ── Photoshoot Models ─────────────────────────────────────────────────────
    shoot_models = [
        ("m1", "Indian Man", "indian_man.png"),
        ("m2", "Indian Woman", "indian_woman.png"),
        ("m3", "Indian Boy", "indian_boy.png"),
        ("m4", "Indian Girl", "indian_girl.png"),
        ("m5", "Baby Boy", "baby_boy.png"),
        ("m6", "Baby Girl", "baby_girl.png"),
        ("m7", "International Man", "inter_man.png"),
        ("m8", "International Woman", "inter_woman.png"),
        ("m9", "International Boy", "inter_boy.png"),
        ("m10", "International Girl", "inter_girl.png"),
    ]
    for i, (mid, name, fname) in enumerate(shoot_models):
        url = _copy(fname, "models", fname)
        docs.append({
            "model_id": mid,
            "name": name,
            "sub_type": "photoshoot",
            "image_url": url,
            "is_active": True,
            "order": i + 1,
            "photos": [],
            "poses": [],
            "before_image_url": None,
            "after_image_url": None,
            "created_at": now,
            "updated_at": now,
        })

    # ── Catalogue Models ──────────────────────────────────────────────────────
    catalogue_defs = [
        ("indian-man", "Indian Man", "indian-man", "indian-man", "indian_man.png"),
        ("indian-woman", "Indian Woman", "indian-woman", "indian-woman", "indian_woman.png"),
        ("indian-boy", "Indian Boy", "indian-boy", "indian-boy", "indian_boy.png"),
        ("indian-girl", "Indian Girl", "indian-girl", "indian-girl", "indian_girl.png"),
        ("international-man", "International Man", "inter-man", "inter-man", "inter_man.png"),
    ]
    for i, (mid, name, prefix, asset_dir, thumb) in enumerate(catalogue_defs):
        thumb_url = _copy(thumb, "models", thumb)
        photos = _build_catalogue_photos(prefix, asset_dir)
        docs.append({
            "model_id": mid,
            "name": name,
            "sub_type": "catalogue",
            "image_url": thumb_url,
            "is_active": True,
            "order": i + 1,
            "photos": photos,
            "poses": [],
            "before_image_url": None,
            "after_image_url": None,
            "created_at": now,
            "updated_at": now,
        })

    # ── Branding Models ───────────────────────────────────────────────────────
    branding_defs = [
        ("branding-indian-man", "Indian Man", "indian-man", "indian-man", "bim", "indian_man.png"),
        ("branding-indian-woman", "Indian Woman", "indian-woman", "indian-woman", "biw", "indian_woman.png"),
        ("branding-indian-boy", "Indian Boy", "indian-boy", "indian-boy", "bib", "indian_boy.png"),
        ("branding-indian-girl", "Indian Girl", "indian-girl", "indian-girl", "big", "indian_girl.png"),
        ("branding-inter-man", "International Man", "inter-man", "inter-man", "bintm", "inter_man.png"),
    ]
    for i, (mid, name, prefix, asset_dir, id_prefix, thumb) in enumerate(branding_defs):
        thumb_url = _copy(thumb, "models", thumb)
        poses = _build_branding_poses(prefix, asset_dir, id_prefix)
        docs.append({
            "model_id": mid,
            "name": name,
            "sub_type": "branding",
            "image_url": thumb_url,
            "is_active": True,
            "order": i + 1,
            "photos": [],
            "poses": poses,
            "before_image_url": thumb_url,
            "after_image_url": thumb_url,
            "created_at": now,
            "updated_at": now,
        })

    app_models_col.insert_many(docs)
    print(f"✅ Seeded {len(docs)} app models (photoshoot + catalogue + branding)")


# ═══════════════════════════════════════════════════════════════════════════════
# 3. BRANDING BACKGROUNDS
# ═══════════════════════════════════════════════════════════════════════════════

def _seed_backgrounds():
    branding_bg_col.drop()
    now = datetime.utcnow()
    docs = []

    # Color swatches
    colors = [
        ("bg-white", "Pure White", "#FFFFFF"),
        ("bg-cream", "Cream", "#F8F5EE"),
        ("bg-ivory", "Ivory", "#FFFFF0"),
        ("bg-light-gray", "Light Gray", "#F2F2F2"),
        ("bg-warm-gray", "Warm Gray", "#E8E4DF"),
        ("bg-charcoal", "Charcoal", "#2C2C2C"),
        ("bg-black", "Black", "#000000"),
        ("bg-navy", "Navy", "#1A2744"),
        ("bg-forest", "Forest Green", "#1A3A2A"),
        ("bg-blush", "Blush Pink", "#F4D5D5"),
        ("bg-lavender", "Lavender", "#E8DEFF"),
        ("bg-gold-tint", "Gold Tint", "#FFF8E7"),
        ("bg-sky", "Sky Blue", "#E7F4FF"),
        ("bg-mint", "Mint", "#E0F7F4"),
        ("bg-rose", "Rose Gold", "#F9E5E5"),
    ]
    for i, (bid, label, color) in enumerate(colors):
        docs.append({
            "bg_id": bid,
            "type": "color",
            "label": label,
            "color": color,
            "image_url": None,
            "is_active": True,
            "order": i + 1,
            "created_at": now,
            "updated_at": now,
        })

    # Image backgrounds
    for i in range(1, 6):
        fname = f"back-{i}.webp"
        url = _copy(f"background/{fname}", "backgrounds", fname)
        docs.append({
            "bg_id": f"bg-img-{i}",
            "type": "image",
            "label": f"Background {i}",
            "color": None,
            "image_url": url,
            "is_active": True,
            "order": len(colors) + i,
            "created_at": now,
            "updated_at": now,
        })

    branding_bg_col.insert_many(docs)
    print(f"✅ Seeded {len(docs)} branding backgrounds")


# ═══════════════════════════════════════════════════════════════════════════════
# 4. PROMPT TEMPLATES  (system + quality prompts)
# ═══════════════════════════════════════════════════════════════════════════════

def _seed_prompts():
    prompt_templates_col.drop()
    now = datetime.utcnow()

    docs = [
        {
            "template_id": "system_prompt",
            "name": "System Prompt",
            "type": "system",
            "content": """You are a professional AI image generation system specialized in
photorealistic product visualization and virtual try-on.

Your goal:
- Generate highly realistic images
- Preserve human anatomy and proportions
- Maintain correct lighting, shadows, and perspective
- Produce studio-quality commercial images

Avoid:
- Distorted faces or bodies
- Unrealistic textures
- Cartoonish or illustrative styles""",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        },
        {
            "template_id": "quality_prompt",
            "name": "Quality Prompt",
            "type": "quality",
            "content": """Quality constraints:
- Ultra-realistic
- Photographic
- High resolution
- No distortion
- No artifacts
- No cartoon or illustration style""",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        },
    ]

    prompt_templates_col.insert_many(docs)
    print(f"✅ Seeded {len(docs)} prompt templates")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("🌱 Seeding database...")
    _ensure_dirs()
    _seed_categories()
    _seed_models()
    _seed_backgrounds()
    _seed_prompts()
    print("\n🎉 All seed data inserted successfully!")
    print("   Collections: categories, app_models, branding_backgrounds, prompt_templates")
