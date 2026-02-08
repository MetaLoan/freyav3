#!/usr/bin/env python3
"""
Freya V3 - Gemini Imagen 素材生成工具

使用方法:
  python3 scripts/generate-asset.py --prompt "描述" --output assets/output.png
  python3 scripts/generate-asset.py --prompt "描述" --output assets/icon.png --model pro --size 2K --ratio 1:1
  python3 scripts/generate-asset.py --prompt "描述" --output assets/sticker.png --transparent

参数:
  --prompt     图片描述（英文效果最佳）
  --output     输出文件路径
  --model      模型选择: flash (快速) | pro (高质量，默认)
  --size       分辨率 (仅 pro): 1K | 2K | 4K
  --ratio      宽高比: 1:1 | 2:3 | 3:2 | 3:4 | 4:3 | 9:16 | 16:9 等
  --transparent 生成透明背景素材（自动在 prompt 末尾追加指令）
  --style      预设风格: mystical | icon | tarot | cosmic
"""

import argparse
import os
import sys
import base64

# Gemini API Key
API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyB5RXoij3tZ1CL6f3p1oZcNt2-d2E2Xx28')

# 预设风格 prompt 前缀
STYLE_PRESETS = {
    'mystical': (
        'In a mystical luxury dark aesthetic with warm golden and deep brown tones, '
        'celestial motifs (moon phases, stars, constellations), and ornate golden line art decorations. '
    ),
    'icon': (
        'A clean, elegant icon design with a transparent background. '
        'Use a warm golden color palette (#C49A6C to #D4A574) with subtle glow effects. '
        'No text. '
    ),
    'tarot': (
        'A tarot card illustration in black and gold art style, with intricate golden line art '
        'on a deep black background, featuring celestial and mystical symbolism. '
        'The style is elegant, detailed, and reminiscent of classic tarot decks with a modern luxury twist. '
    ),
    'cosmic': (
        'A cosmic space scene with deep blues, purples, and warm golden accents. '
        'Features planets, nebulae, stars, and celestial bodies with a dreamy, luxurious feel. '
    ),
}


def generate_image(prompt: str, output_path: str, model: str = 'pro',
                   size: str = '1K', ratio: str = '1:1', transparent: bool = False,
                   style: str = None):
    """使用 Gemini API 生成图片"""
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print('❌ 请先安装 google-genai: pip3 install google-genai')
        sys.exit(1)

    client = genai.Client(api_key=API_KEY)

    # 构建完整 prompt
    full_prompt = ''
    if transparent:
        # 根据文档，透明背景需要使用特定的模板格式
        # 文档模板: "A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. 
        # The design should have [line style] and [shading style]. The background must be transparent."
        if style and style in STYLE_PRESETS:
            style_prefix = STYLE_PRESETS[style].replace('A clean, elegant icon design with a transparent background. ', '')
            full_prompt = f'A {style} sticker of {prompt}, featuring {style_prefix}. The design should have thin line style and minimal shading. The background must be transparent.'
        else:
            full_prompt = f'A sticker of {prompt}. The design should have thin line style. The background must be transparent.'
    else:
        if style and style in STYLE_PRESETS:
            full_prompt += STYLE_PRESETS[style]
        full_prompt += prompt

    # 选择模型
    model_name = 'gemini-3-pro-image-preview' if model == 'pro' else 'gemini-2.5-flash-image'

    print(f'🎨 模型: {model_name}')
    print(f'📐 宽高比: {ratio} | 分辨率: {size}')
    print(f'📝 Prompt: {full_prompt[:120]}...' if len(full_prompt) > 120 else f'📝 Prompt: {full_prompt}')
    print(f'⏳ 正在生成...')

    # 使用 requests 直接调用 REST API 以绕过 SDK 限制
    import requests
    import json

    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}'
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"] if model == 'pro' else ["IMAGE"],
            "imageConfig": {
                "aspectRatio": ratio
            }
        }
    }
    
    if model == 'pro':
        payload["generationConfig"]["imageConfig"]["imageSize"] = size

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        
        # 保存图片
        os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
        saved = False
        
        # 处理响应
        if 'candidates' in result and result['candidates']:
            for candidate in result['candidates']:
                if 'content' in candidate and 'parts' in candidate['content']:
                    for part in candidate['content']['parts']:
                        if 'text' in part:
                            print(f'💬 模型说: {part["text"]}')
                        if 'inlineData' in part:
                            # 解码 base64 图片
                            img_data = base64.b64decode(part['inlineData']['data'])
                            with open(output_path, 'wb') as f:
                                f.write(img_data)
                            saved = True
                            print(f'✅ 图片已保存: {output_path}')
        
        if not saved:
            print('❌ 未生成图片，API 响应中未找到图片数据')
            # print(json.dumps(result, indent=2))
            sys.exit(1)
            
    except Exception as e:
        print(f'❌ API 请求失败: {str(e)}')
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='Freya V3 Gemini 素材生成工具')
    parser.add_argument('--prompt', '-p', required=True, help='图片描述')
    parser.add_argument('--output', '-o', required=True, help='输出文件路径')
    parser.add_argument('--model', '-m', choices=['flash', 'pro'], default='pro', help='模型选择')
    parser.add_argument('--size', '-s', choices=['1K', '2K', '4K'], default='1K', help='分辨率(仅 pro)')
    parser.add_argument('--ratio', '-r', default='1:1', help='宽高比')
    parser.add_argument('--transparent', '-t', action='store_true', help='透明背景')
    parser.add_argument('--style', choices=['mystical', 'icon', 'tarot', 'cosmic'], help='预设风格')

    args = parser.parse_args()
    generate_image(args.prompt, args.output, args.model, args.size, args.ratio, args.transparent, args.style)


if __name__ == '__main__':
    main()
