# 生成图腾图案

使用 Gemini API 生成透明背景的神秘图腾图案。

## 快速生成

```bash
# 使用 Pro 模型（高质量，2K 分辨率）
python3 scripts/generate-asset.py \
  --prompt "A mystical golden line art totem pattern featuring: radiating sun rays from center, concentric circles, moon phases on sides, scattered stars, decorative arcs, and small dots. Elegant, minimalist, single-line style in warm golden color (#C49A6C). The design should be symmetrical and suitable as a decorative background element." \
  --output assets/totem-pattern.png \
  --model pro \
  --size 2K \
  --ratio 16:9 \
  --transparent \
  --style mystical

# 或使用 Flash 模型（快速）
python3 scripts/generate-asset.py \
  --prompt "A mystical golden line art totem pattern with radiating sun rays, concentric circles, moon phases, stars, and decorative elements. Minimalist single-line style in warm golden color. Symmetrical design for background decoration." \
  --output assets/totem-pattern.png \
  --model flash \
  --ratio 16:9 \
  --transparent \
  --style mystical
```

## 在代码中使用

生成图片后，在 `MysticalBackground` 组件中传入图片：

```tsx
import totemPattern from '@/assets/totem-pattern.png';

<MysticalBackground totemImageSource={totemPattern}>
  {/* 页面内容 */}
</MysticalBackground>
```

## 提示词优化建议

如果生成的效果不理想，可以尝试：

1. **更详细的描述**：
   - "Delicate golden line art with thin 1px strokes"
   - "Centered composition with radial symmetry"
   - "Warm amber-gold color palette (#C49A6C to #D4A574)"

2. **调整风格**：
   - 去掉 `--style mystical` 使用更简洁的描述
   - 尝试不同的宽高比（如 `21:9` 用于超宽屏）

3. **多次生成**：
   - Gemini 每次生成的结果可能不同，可以多试几次
