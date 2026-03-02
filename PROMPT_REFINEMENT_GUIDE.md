# AI Prompt Refinement System - Guide

## 🎯 Overview

The video ads generation system now includes **category-specific AI prompt refinement** that transforms basic user ideas into detailed, professional video generation prompts following industry-standard formats.

---

## ✅ What's Updated

### Backend Changes

**File: `backend/services/video_generation_service.py`**

Added category-specific refinement templates for:
- **Jewelry** - Luxury showcase with sparkle and elegance
- **Fashion** - Trendy apparel with dynamic movements
- **Electronics** - Tech reviews with feature demonstrations
- **Beauty** - Cosmetics application with texture details
- **Food** - Dining reviews with appetizing visuals
- **Automotive** - Car showcases with premium aesthetics

Each template includes:
- Style specifications (UGC, cinematic, Instagram Reels)
- Visual quality details (lighting, color grading, textures)
- Setting descriptions (props, ambiance, locations)
- Subject guidelines (appearance, clothing, expressions)
- Camera movements (push-in, close-ups, tracking shots)
- Lighting setups (warm tones, directional, RGB)
- Action sequences (gestures, demonstrations, reveals)
- Dialogue format (natural Hinglish in curly braces)
- Duration and timing (9-12 seconds with scene breakdown)

**File: `backend/routes/video.py`**

Updated `/video/refine-prompt` endpoint to:
- Accept `category` parameter
- Pass category to refinement function
- Return category in response

### Frontend Changes

**File: `src/services/videoApi.ts`**

Updated `refinePrompt()` function to:
- Accept `category` parameter
- Send category to backend
- Log category for debugging

**File: `src/screens/ads/AdsPromptScreen.tsx`**

Updated `handleRefinePrompt()` to:
- Pass `category.id` to API call
- Log category for debugging

---

## 📋 Refinement Templates

### Jewelry Template
```
Style: High-end UGC-style promotional video, cinematic realism, 9:16 vertical format
Visual Quality: Shot on high-end smartphone with professional lighting, warm premium tones, shallow depth of field, crisp textures
Setting: Upscale boutique or elegant home setting with premium lighting
Subject: Well-groomed Indian person showcasing jewelry piece
Camera: Slow cinematic push-in, natural handheld micro-movements, shallow depth of field with bokeh
Lighting: Soft directional light highlighting jewelry sparkle and textures, high contrast premium grading
Action: Natural gestures, genuine expressions, jewelry as hero element
Dialogue: Natural Hinglish commentary about craftsmanship, design, and premium quality
Duration: 9-12 seconds with scene flow breakdown
Details: Include specific jewelry movements (rotation, close-ups of gems), light reflections, elegant presentation
```

### Fashion Template
```
Style: Instagram Reels aesthetic, trendy UGC-style, 9:16 vertical format
Visual Quality: High-quality smartphone footage, vibrant colors, sharp details, modern color grading
Setting: Urban trendy location or stylish home setting with good natural light
Subject: Young fashionable Indian person wearing the featured apparel
Camera: Dynamic movements - slow-motion walks, twirls, close-up details, medium to close shots
Lighting: Natural bright lighting or golden hour, highlighting fabric textures and colors
Action: Confident movements, outfit reveals, detail shots of fabric/accessories
Dialogue: Casual Hinglish about style, comfort, versatility, and trend appeal
Duration: 9-12 seconds with quick cuts matching energy
Details: Include fabric movement, texture close-ups, styling tips, multiple angles
```

### Electronics Template
```
Style: Modern tech review UGC-style, sleek and professional, 9:16 vertical format
Visual Quality: Crisp 4K-style footage, clean backgrounds, product as focal point
Setting: Modern minimalist desk setup or tech-friendly environment with clean aesthetics
Subject: Tech-savvy Indian reviewer demonstrating product features
Camera: Smooth product reveals, close-ups of features, over-shoulder shots, stable movements
Lighting: Clean bright lighting highlighting product design and screen clarity
Action: Product interaction, feature demonstrations, hands-on usage, screen showcases
Dialogue: Informative Hinglish about specs, features, performance, and value
Duration: 9-12 seconds with feature highlights
Details: Include product close-ups, UI demonstrations, size comparisons, key feature callouts
```

### Beauty Template
```
Style: Beauty influencer UGC-style, Instagram Reels aesthetic, 9:16 vertical format
Visual Quality: Soft focus beauty lighting, vibrant colors, skin-tone accurate grading
Setting: Well-lit vanity setup or bathroom with clean aesthetic background
Subject: Indian beauty enthusiast demonstrating product application
Camera: Close-up face shots, product close-ups, application process, before/after angles
Lighting: Ring light or soft diffused lighting for flattering skin tones and product colors
Action: Product application, texture showcases, blending techniques, final look reveal
Dialogue: Excited Hinglish about texture, pigmentation, longevity, and results
Duration: 9-12 seconds showing application to result
Details: Include product texture close-ups, skin interaction, color payoff, glow/finish shots
```

### Food Template
```
Style: Food review UGC-style, premium dining aesthetic, 9:16 vertical format
Visual Quality: Cinematic food photography style, warm tones, appetizing color grading, sharp textures
Setting: Restaurant interior or home kitchen with premium ambiance, wooden tables, designer elements
Subject: Food enthusiast Indian reviewer with genuine expressions
Camera: Slow push-in to food, close-ups of textures, steam rising, natural handheld feel
Lighting: Warm directional light on food, highlights on textures and plating, soft shadows
Action: Food presentation, genuine reactions, subtle gestures toward dish, occasional taste moments
Dialogue: Enthusiastic Hinglish about taste, presentation, ambiance, and overall experience
Duration: 9-12 seconds with food as hero element
Details: Include steam/heat visuals, texture close-ups, plating details, ambient restaurant sounds
```

### Automotive Template
```
Style: Premium car showcase UGC-style, cinematic automotive aesthetic, 9:16 vertical format
Visual Quality: High-end production value, dynamic shots, sleek reflections, premium grading
Setting: Urban roads, scenic drives, or premium showroom with dramatic lighting
Subject: Car enthusiast or owner showcasing vehicle features
Camera: Smooth tracking shots, detail close-ups of features, interior/exterior reveals, dynamic angles
Lighting: Dramatic lighting highlighting car curves and reflections, golden hour or studio lighting
Action: Car movements, door opens, feature demonstrations, driving shots, interior comfort showcase
Dialogue: Confident Hinglish about performance, features, design, and driving experience
Duration: 9-12 seconds with dynamic scene transitions
Details: Include reflection details, LED light showcases, interior luxury shots, smooth motion
```

---

## 🎬 Example Transformations

### Input (User's Basic Idea)
```
"A diamond necklace showcase"
```

### Output (AI Refined Prompt - Jewelry Category)
```
A 12-second 9:16 luxury jewelry advertisement with cinematic realism. Shot on high-end smartphone with professional lighting in an upscale boutique setting. A well-groomed Indian woman in elegant attire showcases a diamond necklace. Scene flow: 0-3s medium shot with slow cinematic push-in as she lifts the necklace from a velvet cushion, 3-6s close-up of the necklace rotating with light reflections highlighting each diamond's sparkle, 6-9s over-shoulder shot showing her wearing it with genuine admiration, 9-12s final close-up of the necklace on her neck with soft bokeh background. Warm premium tones, shallow depth of field, soft directional lighting creating sparkle. Natural Hinglish dialogue: {Yeh necklace ka har diamond itna perfect hai, craftsmanship dekho... bilkul premium quality, special occasions ke liye perfect piece hai}. High contrast premium grading, crisp textures, elegant presentation.
```

---

### Input (User's Basic Idea)
```
"Smartphone review showing camera features"
```

### Output (AI Refined Prompt - Electronics Category)
```
A 12-second 9:16 tech review UGC-style video in a modern minimalist desk setup with clean white background. A tech-savvy Indian male reviewer in casual attire demonstrates smartphone camera features. Scene flow: 0-3s medium shot of reviewer holding phone with screen visible, 3-6s close-up of phone camera module with smooth product reveal, 6-9s over-shoulder shot showing camera app UI in action, 9-12s side-by-side comparison of photos taken with the phone displayed on laptop screen. Clean bright lighting highlighting phone design and screen clarity, crisp 4K-style footage. Natural Hinglish dialogue: {Iss phone ka camera setup dekho, 50MP main sensor hai... low light mein bhi photos kaafi sharp aati hain, aur yeh AI features... honestly game-changer hai}. Stable movements, product as focal point, feature demonstrations with UI showcases.
```

---

### Input (User's Basic Idea)
```
"Restaurant food review"
```

### Output (AI Refined Prompt - Food Category)
```
A 12-second 9:16 food review UGC-style video with premium dining aesthetic. Shot in upscale restaurant interior with warm wooden tables and designer curved-back chairs. An Indian food enthusiast reviewer sits with a beautifully plated biryani dish in front of him, steam rising naturally. Scene flow: 0-3s slow push-in from medium shot to close-up of the dish, 3-6s extreme close-up of biryani texture with fork lifting aromatic rice, 6-9s reviewer's genuine impressed expression with subtle gesture toward the dish, 9-12s final shot of the complete plating with ambient restaurant sounds. Warm directional lighting on food highlighting textures and colors, cinematic food photography style with appetizing color grading. Natural Hinglish dialogue: {Guys, yeh biryani ka flavor... matlab har grain perfectly cooked hai, aur yeh aroma... restaurant ka ambiance bhi kaafi premium hai, South Delhi mein agar authentic biryani chahiye toh yeh place must-try hai}. Shallow depth of field, soft shadows, food as hero element.
```

---

## 🔧 How It Works

### User Flow:
1. User selects category (e.g., "Jewelry")
2. User enters basic prompt: "A diamond ring showcase"
3. User taps "Refine with AI"
4. Backend receives: `{ prompt: "A diamond ring showcase", category: "jewelry" }`
5. System selects Jewelry template
6. Gemini 2.0 Flash transforms basic idea using template guidelines
7. Returns detailed, production-ready prompt
8. User sees refined prompt with all professional details
9. User can use refined prompt or edit further

### Backend Processing:
```python
def refine_prompt_with_ai(user_prompt: str, category: str = "general"):
    # Select category-specific template
    template = category_templates.get(category.lower(), default_template)
    
    # Create system instruction with template
    system_prompt = f"""Expert video prompt creator.
    {template}
    
    Transform user's basic idea into detailed professional prompt with:
    - Specific timings (0-3s, 3-6s, etc.)
    - Camera movements (push-in, close-up, etc.)
    - Lighting details (warm tones, directional, etc.)
    - Setting with props
    - Subject description
    - Hinglish dialogue in {curly braces}
    - Visual quality specs
    """
    
    # Generate refined prompt
    refined = gemini.generate(user_prompt, system_prompt)
    return refined
```

---

## 📊 Refinement Quality

### Key Elements Added:
✅ **Timing Breakdown** - Specific scene timings (0-3s, 3-6s, etc.)
✅ **Camera Movements** - Push-in, close-up, over-shoulder, tracking
✅ **Lighting Setup** - Warm tones, directional, soft, RGB, golden hour
✅ **Setting Details** - Props, ambiance, location specifics
✅ **Subject Description** - Appearance, clothing, expressions
✅ **Dialogue Format** - Natural Hinglish in {curly braces}
✅ **Visual Quality** - Cinematic, UGC-style, color grading
✅ **Action Sequences** - Gestures, demonstrations, reveals
✅ **Duration** - 9-12 seconds optimized for social media
✅ **Technical Specs** - 9:16 format, resolution, style

---

## 🧪 Testing

### Test Refinement:
```bash
# Test backend endpoint
curl -X POST http://192.168.1.9:5000/video/refine-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A luxury watch showcase",
    "category": "jewelry"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "original_prompt": "A luxury watch showcase",
  "refined_prompt": "A 12-second 9:16 luxury jewelry advertisement with cinematic realism. Shot on high-end smartphone with professional lighting in an upscale boutique setting. A well-groomed Indian man in formal attire showcases a luxury watch...",
  "category": "jewelry"
}
```

### Frontend Test:
1. Open app → Tap video camera icon
2. Select "Jewelry" category
3. Enter: "A gold bracelet showcase"
4. Tap "Refine with AI"
5. Wait 2-3 seconds
6. See detailed refined prompt with all professional elements

---

## 📝 Console Logs

### Backend:
```
--- Refine Prompt Request ---
Category: jewelry
Original Prompt: A gold bracelet showcase
[Prompt Refinement] Original prompt: A gold bracelet showcase
[Prompt Refinement] Category: jewelry
[Prompt Refinement] Refined prompt: A 12-second 9:16 luxury jewelry advertisement...
✓ Prompt refined successfully
```

### Frontend:
```
Refining prompt for category: jewelry
API: Refining prompt...
API: Category: jewelry
API: Prompt refined successfully
✓ Prompt refined successfully
```

---

## 🎨 Prompt Structure

All refined prompts follow this structure:

1. **Opening** - Duration, format, style
2. **Visual Quality** - Camera specs, color grading
3. **Setting** - Location, props, ambiance
4. **Subject** - Appearance, clothing, role
5. **Scene Flow** - Timing breakdown (0-3s, 3-6s, etc.)
6. **Camera Work** - Movements, angles, focus
7. **Lighting** - Setup, direction, mood
8. **Dialogue** - Natural Hinglish in {braces}
9. **Technical Details** - Resolution, aspect ratio, effects

---

## 🚀 Benefits

### For Users:
- Transform simple ideas into professional prompts
- Learn video production terminology
- Get category-appropriate suggestions
- Save time on prompt crafting

### For Video Quality:
- Consistent professional structure
- Detailed technical specifications
- Proper timing and pacing
- Industry-standard formatting

### For AI Generation:
- Clear, unambiguous instructions
- Specific visual and audio details
- Proper scene breakdown
- Production-ready format

---

## 🔄 Customization

To add new categories or modify templates:

1. Edit `backend/services/video_generation_service.py`
2. Add new entry to `category_templates` dict
3. Follow existing template structure
4. Include all key elements (style, camera, lighting, etc.)
5. Restart backend server

Example:
```python
"sports": """Create a sports action advertisement prompt following this structure:

Style: Dynamic sports UGC-style, high-energy aesthetic, 9:16 vertical format
Visual Quality: High frame rate footage, vibrant colors, motion blur for speed
Setting: Sports venue, gym, or outdoor athletic location
Subject: Athletic Indian person demonstrating sports activity
Camera: Fast tracking shots, slow-motion action, dynamic angles
Lighting: Natural outdoor or bright gym lighting
Action: Athletic movements, product in use, performance showcase
Dialogue: Energetic Hinglish about performance, comfort, and results
Duration: 9-12 seconds with high-energy cuts
Details: Include action sequences, product benefits, athletic aesthetics"""
```

---

## ✅ Summary

The AI prompt refinement system now:
- Uses category-specific templates for professional results
- Transforms basic ideas into detailed, production-ready prompts
- Includes all necessary technical specifications
- Follows industry-standard formats
- Generates consistent, high-quality prompts
- Works seamlessly with Gemini Veo video generation

**Ready to use!** Just restart the backend and test the refinement flow. 🎬
