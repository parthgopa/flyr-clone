"""
Category scenario configuration.

Each category maps to a list of scenario dicts with:
  - id: unique scenario key
  - label: human-readable name shown in UI
  - prompt_hint: extra context appended to the base prompt for this scenario

To change the number of generated images for a category,
simply add or remove entries from its list below.
"""

CATEGORY_SCENARIOS = {
    "jewelry": [
        {
            "id": "temple",
            "label": "Temple Visit",
            "prompt_hint": "The person is visiting a grand traditional temple. Warm golden ambient light, ornate architecture in the background. The jewelry should complement the traditional, spiritual setting."
        },
        # {
        #     "id": "party",
        #     "label": "Party Look",
        #     "prompt_hint": "The person is at an elegant evening party or cocktail event. Glamorous indoor lighting with bokeh, stylish decor in the background. The jewelry should sparkle under party lights."
        # },
        # {
        #     "id": "wedding",
        #     "label": "Wedding",
        #     "prompt_hint": "The person is at a beautiful wedding ceremony. Soft romantic lighting, floral decorations, luxurious venue. The jewelry should look bridal and elegant."
        # },
    ],

    "fashion": [
        {
            "id": "travel",
            "label": "Travel",
            "prompt_hint": "The person is traveling at a scenic destination — airport lounge, train station, or iconic landmark. The outfit should look travel-ready, comfortable yet stylish. Natural daylight."
        },
        # {
        #     "id": "destination",
        #     "label": "Destination",
        #     "prompt_hint": "The person is at a beautiful vacation destination — beach resort, mountain view, or European street. The clothing should suit the destination vibe. Golden-hour lighting."
        # },
        # {
        #     "id": "casual",
        #     "label": "Casual Day",
        #     "prompt_hint": "The person is in a casual everyday setting — coffee shop, park, or city sidewalk. Relaxed, natural pose. Soft natural lighting. The outfit should look effortlessly stylish."
        # },
    ],

    "home": [
        {
            "id": "living_room",
            "label": "Living Room",
            "prompt_hint": "A person is sitting or standing in a modern living room alongside the uploaded home decor product. Warm ambient interior lighting, cozy atmosphere. The product should be naturally placed in the room."
        },
        {
            "id": "bedroom",
            "label": "Bedroom",
            "prompt_hint": "A person is in a well-decorated bedroom with the uploaded home decor product. Soft warm lighting, comfortable setting. The product blends naturally into the bedroom interior."
        },
    ],

    "kitchen": [
        {
            "id": "modern_kitchen",
            "label": "Modern Kitchen",
            "prompt_hint": "The product is placed in a sleek modern kitchen with clean countertops, stainless steel appliances, and bright overhead lighting. A person is using or standing near the product naturally."
        },
        {
            "id": "dining_table",
            "label": "Dining Setup",
            "prompt_hint": "The product is arranged on a beautifully set dining table. Warm candlelight or pendant lighting, elegant tableware. A person is seated at or near the table."
        },
    ],

    "electronics": [
        {
            "id": "desk_setup",
            "label": "Desk Setup",
            "prompt_hint": "The electronic product is placed on a clean modern desk setup. Ambient LED lighting, minimalist workspace. A person is using or interacting with the product."
        },
        # {
        #     "id": "outdoor",
        #     "label": "On the Go",
        #     "prompt_hint": "A person is using the electronic product outdoors — park bench, café terrace, or urban street. Natural daylight, lifestyle photography feel."
        # },
        # {
        #     "id": "cozy_home",
        #     "label": "Cozy Home",
        #     "prompt_hint": "A person is using the electronic product in a cozy home environment — sofa, bed, or reading nook. Warm soft lighting, relaxed atmosphere."
        # },
    ],

    "beauty": [
        {
            "id": "vanity",
            "label": "Vanity Mirror",
            "prompt_hint": "The person is applying or showcasing the beauty product at a vanity mirror setup. Soft ring-light illumination, clean beauty station. Professional makeup look."
        },
        {
            "id": "outdoor_glow",
            "label": "Outdoor Glow",
            "prompt_hint": "The person is outdoors in golden-hour sunlight, showcasing the beauty product with a natural radiant glow. Garden, rooftop, or beach setting."
        },
        {
            "id": "night_out",
            "label": "Night Out",
            "prompt_hint": "The person is ready for a night out, showcasing the beauty product under dramatic evening lighting. Glamorous background, city lights or upscale venue."
        },
    ],

    "sports": [
        # {
        #     "id": "gym",
        #     "label": "At the Gym",
        #     "prompt_hint": "The person is at a modern gym, wearing or using the sports product. Energetic atmosphere, gym equipment in background. Dynamic lighting."
        # },
        {
            "id": "outdoor_run",
            "label": "Outdoor Run",
            "prompt_hint": "The person is running or jogging outdoors on a trail, park, or city street with the sports product. Morning light, active and energetic pose."
        },
        # {
        #     "id": "yoga",
        #     "label": "Yoga & Wellness",
        #     "prompt_hint": "The person is in a calm yoga or wellness setting — studio, garden, or beach. Wearing or using the sports product. Peaceful, serene atmosphere with soft natural light."
        # },
    ],
}


def get_scenarios(category_id: str) -> list:
    """Return the scenario list for a category. Defaults to a single generic scenario."""
    return CATEGORY_SCENARIOS.get(category_id, [
        {
            "id": "default",
            "label": "Generated",
            "prompt_hint": "Place the product naturally with the person in a realistic, well-lit environment."
        }
    ])
