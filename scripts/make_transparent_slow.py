from PIL import Image
import sys

try:
    print("Opening image...")
    img = Image.open("assets/totem-pattern.png").convert("RGBA")
    pixels = img.load()
    width, height = img.size
    print(f"Size: {width}x{height}")
    
    print("Processing pixels...")
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]
            # Simple threshold for black
            if r < 30 and g < 30 and b < 30:
                pixels[x, y] = (0, 0, 0, 0)
                
    print("Saving...")
    img.save("assets/totem-pattern.png")
    print("Done!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
