import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URL = os.getenv("MONGO_URL")
    DB_NAME = os.getenv("DB_NAME")
    IP_ADDRESS = os.getenv("EXPO_PUBLIC_IP_ADDRESS")

    GENERATIONS_COLLECTION = "generations"
    MODELS_COLLECTION = "models"
    USERS_COLLECTION = "users"
    CATEGORIES_COLLECTION = "categories"
    APP_MODELS_COLLECTION = "app_models"
    BRANDING_BG_COLLECTION = "branding_backgrounds"
    PROMPT_TEMPLATES_COLLECTION = "prompt_templates"
    ADMIN_SETTINGS_COLLECTION = "admin_settings"

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

config = Config()
