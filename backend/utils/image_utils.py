import uuid
import os
from PIL import Image
from io import BytesIO

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_image_bytes(image_bytes: bytes, custom_filename: str = None, optimize: bool = True, quality: int = 85) -> str:
    """
    Save image bytes to upload directory with optimization.
    
    Args:
        image_bytes: The image data to save
        custom_filename: Optional custom filename (with extension)
        optimize: Whether to optimize/compress the image (default: True)
        quality: JPEG quality 1-100 (default: 85 for good balance)
    
    Returns:
        - URL path (always forward slash)
    """
    
    if custom_filename:
        filename = custom_filename
    else:
        filename = f"{uuid.uuid4()}.jpg"  # Use JPG for better compression

    file_path = os.path.join(UPLOAD_DIR, filename)

    if optimize:
        try:
            # Open image with PIL
            img = Image.open(BytesIO(image_bytes))
            
            # Convert RGBA to RGB if needed (for JPEG)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize if too large (max 1920px on longest side)
            max_size = 1920
            if max(img.size) > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save with optimization
            img.save(file_path, 'JPEG', quality=quality, optimize=True, progressive=True)
            
        except Exception as e:
            print(f"⚠️ Image optimization failed: {e}, saving original")
            # Fallback to original if optimization fails
            with open(file_path, "wb") as f:
                f.write(image_bytes)
    else:
        # Save without optimization
        with open(file_path, "wb") as f:
            f.write(image_bytes)

    url_path = f"uploads/{filename}"
    return url_path
