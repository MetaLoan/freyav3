from PIL import Image
import numpy as np

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # item is (R, G, B, A)
        # If pixel is black (or very dark), make it transparent
        # Threshold can be adjusted. Gold is usually bright.
        if item[0] < 50 and item[1] < 50 and item[2] < 50:
            newData.append((0, 0, 0, 0))
        else:
            # Keep the color but maybe adjust alpha based on brightness?
            # For now, just keep it as is.
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Converted {input_path} to transparent PNG at {output_path}")

if __name__ == "__main__":
    make_transparent("assets/totem-pattern.png", "assets/totem-pattern.png")
