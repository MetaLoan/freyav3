#!/bin/bash

# 创建备份
echo "Backing up assets..."
cp -r assets assets_backup

# 优化 forecast-hero-bg.png (3.4MB -> ?)
# 这是一个背景图，可以安全地缩小尺寸
echo "Optimizing forecast-hero-bg.png..."
sips -Z 1200 assets/forecast-hero-bg.png

# 优化 totem-pattern.png (2.7MB -> ?)
# 纹理图，缩小一半
echo "Optimizing totem-pattern.png..."
sips -Z 1024 assets/totem-pattern.png

# 优化 totem-pattern-bottom.png (2.7MB -> ?)
echo "Optimizing totem-pattern-bottom.png..."
sips -Z 1024 assets/totem-pattern-bottom.png

# 优化 avatar-portrait.png (1.3MB -> ?)
# 头像，缩小到 512
echo "Optimizing avatar-portrait.png..."
sips -Z 512 assets/avatar-portrait.png

# 优化 dimension-*.png (1024px -> 512px)
# 这些是维度图标，512px 足够清晰
echo "Optimizing dimension icons..."
for file in assets/dimension-*.png; do
  sips -Z 512 "$file"
done

# 优化 biorhythm-totem.png (761KB -> ?)
echo "Optimizing biorhythm-totem.png..."
sips -Z 512 assets/biorhythm-totem.png

echo "Optimization complete. Originals backed up in assets_backup/"
