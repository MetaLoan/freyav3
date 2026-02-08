#!/usr/bin/env python3
"""
生成五维运势图腾图标
使用 Gemini API 生成透明背景的图腾图标
"""

from google import genai
from google.genai import types

# 初始化客户端
client = genai.Client(api_key="AIzaSyB5RXoij3tZ1CL6f3p1oZcNt2-d2E2Xx28")

# 定义5个维度的图腾
totems = [
    {
        "name": "Spirit",
        "filename": "dimension-spirit.png",
        "prompt": "A mystical sticker of a spiritual totem symbol, featuring a sacred lotus flower with radiating light rays, third eye symbol, and meditation energy waves. The design should have elegant line art style and golden color tones. The background must be transparent.",
    },
    {
        "name": "Mind",
        "filename": "dimension-mind.png",
        "prompt": "A mystical sticker of a mind/intellect totem symbol, featuring a brain with neural network patterns, geometric sacred symbols, wisdom eye, and constellation connections. The design should have elegant line art style and royal blue color tones. The background must be transparent.",
    },
    {
        "name": "Body",
        "filename": "dimension-body.png",
        "prompt": "A mystical sticker of a body/physical totem symbol, featuring a human chakra system, energy flow lines, heart symbol, vitality waves, and life force spiral. The design should have elegant line art style and coral orange color tones. The background must be transparent.",
    },
    {
        "name": "Emotion",
        "filename": "dimension-emotion.png",
        "prompt": "A mystical sticker of an emotion/feelings totem symbol, featuring moon phases, water ripples, heart waves, emotional energy flow, and intuitive symbols. The design should have elegant line art style and purple color tones. The background must be transparent.",
    },
    {
        "name": "Social",
        "filename": "dimension-social.png",
        "prompt": "A mystical sticker of a social/connection totem symbol, featuring interconnected stars, community circles, relationship nodes, harmony symbols, and unity patterns. The design should have elegant line art style and emerald green color tones. The background must be transparent.",
    },
]

# 逐个生成图腾
for totem in totems:
    print(f"\n生成 {totem['name']} 图腾...")
    
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=totem["prompt"],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
        )
    )
    
    for part in response.parts:
        if part.text is not None:
            print(part.text)
        elif part.inline_data is not None:
            image = part.as_image()
            filepath = f"../assets/{totem['filename']}"
            image.save(filepath)
            print(f"✅ {totem['name']} 图腾已保存到 {filepath}")

print("\n所有图腾生成完成！")
