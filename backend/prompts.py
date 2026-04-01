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
CREATE A PROFESSIONAL JEWELRY PHOTOSHOOT IMAGE:

PRODUCT INTEGRATION:
- Extract the jewelry product from the uploaded product image
- Place the jewelry naturally on the model at the correct anatomical position:
  * Necklaces: around the neck, resting on the collarbone
  * Earrings: on the earlobes, hanging naturally
  * Bangles/Bracelets: on wrists, with proper circular form
  * Rings: on fingers with correct scale and positioning
- The jewelry must look like it's actually being worn, not pasted on
- Maintain the exact design, color, and craftsmanship of the uploaded jewelry
- Preserve all gemstones, metalwork patterns, and intricate details

LIGHTING & REFLECTIONS:
- Apply soft, directional studio lighting that makes the jewelry sparkle
- Create realistic metallic reflections on gold, silver, or platinum surfaces
- Add subtle highlights on gemstones (diamonds, rubies, emeralds) to show brilliance
- Cast natural shadows from the jewelry onto the model's skin
- Ensure the jewelry catches light realistically based on the scene lighting

MODEL PRESERVATION:
- Keep the model's face, body, pose, and clothing exactly as uploaded
- Do NOT alter the model's skin tone, facial features, or expression
- Maintain the model's hair, makeup, and existing accessories
- The model should appear natural and elegant

SCENE REQUIREMENTS:
- Professional studio or lifestyle setting appropriate for luxury jewelry
- Clean, uncluttered background that doesn't distract from the jewelry
- Warm, elegant lighting that enhances the premium feel
- The jewelry should be the focal point of the image

QUALITY STANDARDS:
- Ultra-high resolution, photorealistic rendering
- Sharp focus on the jewelry with slight background blur if appropriate
- No distortion, no unrealistic textures, no cartoon-like appearance
- Commercial photography quality suitable for luxury jewelry brands
- The image should look like it was shot by a professional jewelry photographer

Style: Luxury jewelry editorial photography, ultra-realistic, aspirational.
"""

FASHION_PROMPT = """
CREATE A PROFESSIONAL FASHION PHOTOSHOOT IMAGE:

PRODUCT INTEGRATION:
- Extract the clothing/apparel from the uploaded product image
- Dress the model with the clothing item, ensuring it fits naturally on their body
- The garment must look like it's actually being worn, not overlaid
- Maintain the exact fabric texture, color, pattern, and design of the uploaded clothing
- Preserve all details: buttons, zippers, embroidery, prints, stitching
- Show natural fabric folds, draping, and movement based on the pose

FIT & DRAPING:
- The clothing should fit the model's body proportions correctly
- Create realistic fabric folds at joints (elbows, knees, waist)
- Show natural draping based on fabric type (silk flows, denim is stiff)
- Ensure sleeves, collars, and hems sit naturally on the body
- No distortion of the garment's original design or cut

MODEL PRESERVATION:
- Keep the model's face, body, pose, and proportions exactly as uploaded
- Do NOT alter the model's skin tone, facial features, or expression
- Maintain the model's hair, makeup, and accessories
- The model should appear confident and stylish

SCENE REQUIREMENTS:
- Professional fashion studio or lifestyle setting
- Clean, modern background that complements the clothing style
- Bright, even lighting suitable for fashion photography
- The clothing should be the primary focus

QUALITY STANDARDS:
- Ultra-high resolution, photorealistic rendering
- Sharp focus on fabric details and textures
- Accurate color representation of the garment
- No distortion of body proportions or clothing design
- Commercial photography quality suitable for fashion e-commerce
- The image should look like a professional fashion editorial shoot

Style: High-end fashion editorial photography, contemporary, stylish.
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
CREATE A PROFESSIONAL HOME DECOR PHOTOSHOOT IMAGE:

PRODUCT INTEGRATION:
- Extract the home decor product from the uploaded product image
- Place the product naturally in the scene where the model is positioned
- The product should look like it belongs in the home environment
- Maintain the exact design, color, texture, and materials of the uploaded product
- Preserve all details: patterns, finishes, decorative elements
- Ensure correct scale relative to the room and the model

PLACEMENT & INTERACTION:
- Position the product appropriately (on table, shelf, floor, wall)
- The model can interact with or be near the product naturally
- Show the product in use or as part of the room's decor
- Create realistic shadows from the product onto surfaces
- Ensure proper perspective and spatial relationships

MODEL PRESERVATION:
- Keep the model's face, body, pose, and clothing exactly as uploaded
- Do NOT alter the model's appearance or expression
- The model should appear relaxed and at home in the setting

SCENE REQUIREMENTS:
- Realistic home interior: living room, bedroom, or appropriate space
- Warm, natural lighting from windows or ambient interior lights
- Well-decorated, aspirational home environment
- Clean, organized space that showcases the product

QUALITY STANDARDS:
- Ultra-high resolution, photorealistic rendering
- Accurate material textures (wood, fabric, metal, glass)
- Natural lighting with soft shadows
- Interior design magazine quality
- The image should look like professional lifestyle photography

Style: Modern interior design photography, warm, inviting, aspirational.
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
CREATE A PROFESSIONAL BEAUTY PRODUCT PHOTOSHOOT IMAGE:

PRODUCT INTEGRATION:
- Extract the beauty/cosmetic product from the uploaded product image
- Show the product being used or displayed by the model
- The product can be held, applied, or placed near the model's face
- Maintain the exact packaging, color, branding, and design of the uploaded product
- Preserve all details: labels, caps, textures, finishes
- Ensure the product is clearly visible and recognizable

APPLICATION & DISPLAY:
- If makeup: show subtle, natural application on the model's face
- If skincare: show the product in the model's hand or near their face
- The product should look premium and desirable
- Create realistic reflections on glossy packaging
- Show the product's texture and finish accurately

MODEL PRESERVATION:
- Keep the model's face, features, and expression exactly as uploaded
- Do NOT alter the model's natural skin tone or facial structure
- Maintain the model's hair and existing makeup
- The model should have flawless, glowing skin
- Professional beauty photography makeup standards

SCENE REQUIREMENTS:
- Clean, professional beauty photography setup
- Soft, flattering lighting (ring light or beauty dish effect)
- Minimal, elegant background (white, pastel, or vanity setting)
- Focus on the model's face and the product

QUALITY STANDARDS:
- Ultra-high resolution, photorealistic rendering
- Sharp focus on both the product and the model's face
- Natural skin texture with professional retouching
- Accurate product colors and packaging details
- Beauty magazine editorial quality
- The image should look like a professional cosmetics campaign

Style: Professional beauty campaign photography, glamorous, fresh, radiant.
"""

ELECTRONICS_PROMPT = """
CREATE A PROFESSIONAL ELECTRONICS PRODUCT PHOTOSHOOT IMAGE:

PRODUCT INTEGRATION:
- Extract the electronic device from the uploaded product image
- Place the product naturally in the scene with the model
- The model can hold, use, or be positioned near the device
- Maintain the exact design, color, and features of the uploaded device
- Preserve all details: screens, buttons, ports, logos, finishes
- Ensure correct scale relative to the model's hands/body

DEVICE RENDERING:
- Show sharp, clean edges and precise details
- Create accurate reflections on glass screens and metal surfaces
- If the device has a screen, show it with realistic content
- Maintain the device's original colors and materials (metal, plastic, glass)
- No distortion of buttons, ports, or design elements
- The device should look brand new and premium

MODEL PRESERVATION:
- Keep the model's face, body, pose, and clothing exactly as uploaded
- Do NOT alter the model's appearance or expression
- The model should appear tech-savvy and comfortable with the device
- Natural interaction with the electronic product

SCENE REQUIREMENTS:
- Modern, clean environment (desk, home office, or lifestyle setting)
- Bright, crisp lighting suitable for tech photography
- Minimal, uncluttered background
- Professional, contemporary aesthetic

QUALITY STANDARDS:
- Ultra-high resolution, photorealistic rendering
- Sharp focus on the device with all details visible
- Accurate color reproduction and material textures
- Clean, professional tech product photography
- The image should look like official product marketing material

Style: Modern tech product photography, sleek, innovative, professional.
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
