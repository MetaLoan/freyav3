from PIL import Image

def make_transparent(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # Create a mask based on brightness
    # Convert to grayscale
    grayscale = img.convert("L")
    
    # Threshold: pixels darker than 20 become transparent
    # We can use point() to create a mask
    # If value > 20, alpha = 255, else 0
    mask = grayscale.point(lambda p: 255 if p > 20 else 0)
    
    # Apply mask to alpha channel
    img.putalpha(mask)
    
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    make_transparent("assets/totem-pattern.png", "assets/totem-pattern.png")
