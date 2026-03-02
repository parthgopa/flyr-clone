SYSTEM_PROMPT = """
You are a professional AI image generation system specialized in
photorealistic product visualization and virtual try-on.

Your goal:
- Generate highly realistic images
- Preserve human anatomy and proportions
- Maintain correct lighting, shadows, and perspective
- Produce studio-quality commercial images

Avoid:
- Distorted faces or bodies
- Unrealistic textures
- Cartoonish or illustrative styles
"""

JEWELRY_PROMPT = """
Place the jewelry item naturally on the model.

Rules:
- Correct anatomical placement (neck, ears, wrists, fingers)
- Realistic metallic reflections (gold, silver, diamond)
- Soft studio lighting with subtle highlights
- Accurate scale relative to the body
- Natural skin contact and shadows

Style:
Luxury jewelry photoshoot, ultra-high realism.
"""

FASHION_PROMPT = """
Dress the model with the uploaded clothing item.

Rules:
- Preserve fabric texture and weave
- Natural fabric folds and draping
- Correct body alignment and proportions
- No distortion of arms, legs, or torso
- Outfit should look worn, not pasted

Style:
High-end fashion editorial photography.
"""

ACCESSORIES_PROMPT = """
Place the accessory naturally on the model.

Rules:
- Correct orientation and positioning
- Accurate material texture (leather, metal, glass)
- Natural interaction with the body
- Proper shadows and reflections

Style:
Lifestyle product photography with realism.
"""

KIDS_PROMPT = """
Apply the product to a child-friendly model.

Rules:
- Soft lighting
- Gentle colors
- Safe and natural appearance
- No sharp contrasts or harsh shadows

Style:
Warm, family-friendly commercial photography.
"""

HOME_PROMPT = """
Place the product in a realistic home environment.

Rules:
- Correct perspective and scale
- Natural ambient lighting
- Interior design realism
- Product should blend naturally into the scene

Style:
Modern interior design photography.
"""

ART_PROMPT = """
Showcase the artwork or craft item realistically.

Rules:
- Preserve original textures and colors
- Accurate material appearance
- Clean background or creative studio setup

Style:
High-quality creative product photography.
"""

BEAUTY_PROMPT = """
Apply the beauty product subtly on the model.

Rules:
- Natural skin texture
- No exaggerated makeup
- Clean and professional lighting
- Realistic cosmetic finish

Style:
Professional beauty campaign photography.
"""

ELECTRONICS_PROMPT = """
Place the electronic product in a clean lifestyle setup.

Rules:
- Sharp edges and details
- Accurate reflections on glass and metal
- No distortion of screen or buttons

Style:
Modern tech product photography.
"""

FOOD_PROMPT = """
Present the food item in an appetizing way.

Rules:
- Natural food textures
- Realistic lighting
- No melting or deformation
- Fresh appearance

Style:
Commercial food photography, mouth-watering.
"""

QUALITY_PROMPT = """
Quality constraints:
- Ultra-realistic
- Photographic
- High resolution
- No distortion
- No artifacts
- No cartoon or illustration style
"""
