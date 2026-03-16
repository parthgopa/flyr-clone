"""
Script to compress existing images in the uploads directory.
Run this once to optimize all existing images.
"""
import os
from PIL import Image
from pathlib import Path

UPLOAD_DIR = "uploads"
QUALITY = 85
MAX_SIZE = 1920

def compress_image(file_path):
    """Compress a single image file"""
    try:
        # Skip if already processed or not an image
        if not file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            return False
            
        # Open image
        img = Image.open(file_path)
        original_size = os.path.getsize(file_path)
        
        # Convert RGBA to RGB if needed
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Resize if too large
        if max(img.size) > MAX_SIZE:
            img.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
        
        # Save as optimized JPEG
        new_path = file_path.rsplit('.', 1)[0] + '.jpg'
        img.save(new_path, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
        
        new_size = os.path.getsize(new_path)
        saved = original_size - new_size
        saved_pct = (saved / original_size) * 100 if original_size > 0 else 0
        
        # Remove original if it was PNG
        if file_path != new_path and os.path.exists(file_path):
            os.remove(file_path)
        
        print(f"✅ {os.path.basename(file_path)}: {original_size//1024}KB → {new_size//1024}KB (saved {saved_pct:.1f}%)")
        return True
        
    except Exception as e:
        print(f"❌ Error compressing {file_path}: {e}")
        return False

def main():
    """Compress all images in uploads directory"""
    total_original = 0
    total_compressed = 0
    count = 0
    
    print("🔄 Starting image compression...")
    print(f"Quality: {QUALITY}, Max size: {MAX_SIZE}px\n")
    
    for root, dirs, files in os.walk(UPLOAD_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                original_size = os.path.getsize(file_path)
                
                if compress_image(file_path):
                    # Get new size (might have different extension)
                    new_path = file_path.rsplit('.', 1)[0] + '.jpg'
                    new_size = os.path.getsize(new_path) if os.path.exists(new_path) else original_size
                    
                    total_original += original_size
                    total_compressed += new_size
                    count += 1
    
    if count > 0:
        total_saved = total_original - total_compressed
        saved_pct = (total_saved / total_original) * 100
        
        print(f"\n✅ Compression complete!")
        print(f"📊 Processed: {count} images")
        print(f"💾 Original size: {total_original / (1024*1024):.2f} MB")
        print(f"💾 Compressed size: {total_compressed / (1024*1024):.2f} MB")
        print(f"🎉 Total saved: {total_saved / (1024*1024):.2f} MB ({saved_pct:.1f}%)")
    else:
        print("No images found to compress")

if __name__ == "__main__":
    main()
