#!/usr/bin/env python3
"""
Freya V3 - 去除黑色像素并生成透明 PNG

使用方法:
  python3 scripts/remove-black-pixels.py --input assets/totem-pattern-bottom.png --output assets/totem-pattern-bottom-transparent.png
  python3 scripts/remove-black-pixels.py --input assets/totem-pattern.png --output assets/totem-pattern-transparent.png --threshold 30

参数:
  --input      输入图片路径（支持 PNG, JPG, WEBP）
  --output     输出透明 PNG 路径
  --threshold  黑色阈值 (0-255，默认 30，值越大去除的黑色越多)
  --feather    边缘羽化半径（像素，默认 2，让边缘更柔和）
"""

import argparse
import os
import sys
from PIL import Image, ImageFilter

def remove_black_pixels(input_path: str, output_path: str, threshold: int = 30, feather: int = 2):
    """
    去除图片中的黑色像素，生成透明 PNG
    
    Args:
        input_path: 输入图片路径
        output_path: 输出透明 PNG 路径
        threshold: 黑色阈值 (0-255)，低于此值的像素会被视为黑色
        feather: 边缘羽化半径（像素）
    """
    if not os.path.exists(input_path):
        print(f"❌ 错误: 输入文件不存在: {input_path}")
        sys.exit(1)
    
    print(f"📖 读取图片: {input_path}")
    img = Image.open(input_path)
    
    # 转换为 RGBA 模式（如果还不是）
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 获取像素数据
    pixels = img.load()
    width, height = img.size
    
    print(f"🖼️  图片尺寸: {width}x{height}")
    print(f"🎯 黑色阈值: {threshold} (RGB 值 < {threshold} 的像素将被移除)")
    
    # 创建新的透明图片
    transparent_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    transparent_pixels = transparent_img.load()
    
    removed_count = 0
    kept_count = 0
    
    # 第一遍：去除黑色像素
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # 计算亮度（加权平均）
            brightness = (r * 0.299 + g * 0.587 + b * 0.114)
            
            # 如果像素是黑色（RGB 都低于阈值）或亮度很低，设为透明
            if r < threshold and g < threshold and b < threshold:
                transparent_pixels[x, y] = (0, 0, 0, 0)
                removed_count += 1
            else:
                transparent_pixels[x, y] = (r, g, b, a)
                kept_count += 1
    
    print(f"✅ 已处理: 移除 {removed_count} 个黑色像素，保留 {kept_count} 个像素")
    
    # 第二遍：边缘羽化（可选）
    if feather > 0:
        print(f"✨ 应用边缘羽化 (半径: {feather}px)...")
        # 创建 alpha 通道的副本
        alpha = transparent_img.split()[3]
        # 应用高斯模糊到 alpha 通道
        alpha_blur = alpha.filter(ImageFilter.GaussianBlur(radius=feather))
        # 合并回原图
        transparent_img.putalpha(alpha_blur)
    
    # 保存为透明 PNG
    print(f"💾 保存透明 PNG: {output_path}")
    transparent_img.save(output_path, 'PNG', optimize=True)
    
    # 计算文件大小变化
    input_size = os.path.getsize(input_path)
    output_size = os.path.getsize(output_path)
    size_change = ((output_size - input_size) / input_size) * 100
    
    print(f"📊 文件大小: {input_size / 1024:.1f} KB → {output_size / 1024:.1f} KB ({size_change:+.1f}%)")
    print(f"✅ 完成！透明图片已保存到: {output_path}")

def main():
    parser = argparse.ArgumentParser(
        description='去除图片中的黑色像素，生成透明 PNG',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--input',
        type=str,
        required=True,
        help='输入图片路径（支持 PNG, JPG, WEBP）'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        required=True,
        help='输出透明 PNG 路径'
    )
    
    parser.add_argument(
        '--threshold',
        type=int,
        default=30,
        help='黑色阈值 (0-255，默认 30，值越大去除的黑色越多)'
    )
    
    parser.add_argument(
        '--feather',
        type=int,
        default=2,
        help='边缘羽化半径（像素，默认 2，让边缘更柔和）'
    )
    
    args = parser.parse_args()
    
    # 验证阈值范围
    if not 0 <= args.threshold <= 255:
        print("❌ 错误: threshold 必须在 0-255 之间")
        sys.exit(1)
    
    # 确保输出目录存在
    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📁 创建输出目录: {output_dir}")
    
    remove_black_pixels(args.input, args.output, args.threshold, args.feather)

if __name__ == '__main__':
    main()
