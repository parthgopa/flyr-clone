import uuid
import os

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_image_bytes(image_bytes: bytes, custom_filename: str = None) -> str:
    """
    Save image bytes to upload directory.
    
    Args:
        image_bytes: The image data to save
        custom_filename: Optional custom filename (with extension)
    
    Returns:
        - URL path (always forward slash)
    """
    
    if custom_filename:
        # Use custom filename
        filename = custom_filename
    else:
        # Generate random filename
        filename = f"{uuid.uuid4()}.png"

    # ✅ Filesystem path (for saving)
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(image_bytes)

    # ✅ URL-safe path (always forward slash)
    url_path = f"uploads/{filename}"

    return url_path
