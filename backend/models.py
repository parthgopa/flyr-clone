from google import genai
from config import config

# Initialize Client
client = genai.Client(api_key=config.GEMINI_API_KEY)


image_models = []

# Iterate through all available models
for model in client.models.list():
    # model.name is already a string, no need to join
    name = model.name  
    
    # supported_actions might be a list, so join them with commas
    actions = ", ".join(model.supported_actions) if isinstance(model.supported_actions, list) else str(model.supported_actions)
    

    # methods = model.supported_generation_methods or []
    
    # # Check if the model supports image generation
    # # 'generateImages' is the standard method for Imagen models
    # is_image_generator = "generateImages" in methods
    
    # # Check for Gemini specific image capabilities (like Gemini 2.5 Flash Image)
    # # These sometimes use generateContent but are optimized for image output
    # if "image" in model.name.lower() and "flash" in model.name.lower():
    #      is_image_generator = True

    # if is_image_generator:
    #     image_models.append(model.name)
    #     print(f"🌟 {model.name:<47} | [IMAGE GENERATOR]")
    # else:
    #     # Uncomment the line below if you want to see ALL models (text/chat/embedding)
    #     # print(f"{model.name:<50} | {methods}")
    #     pass

