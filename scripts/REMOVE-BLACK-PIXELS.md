# 去除图腾图片黑色像素

底部图腾图片可能存在黑色边缘截断问题。这里提供两种解决方案：

## 方案 1: 使用 Python 脚本自动抠图（推荐）

### 安装依赖

```bash
pip3 install Pillow
```

### 使用方法

```bash
# 处理底部图腾
python3 scripts/remove-black-pixels.py \
  --input assets/totem-pattern-bottom.png \
  --output assets/totem-pattern-bottom-transparent.png \
  --threshold 30 \
  --feather 2

# 处理顶部图腾（如果需要）
python3 scripts/remove-black-pixels.py \
  --input assets/totem-pattern.png \
  --output assets/totem-pattern-transparent.png \
  --threshold 30 \
  --feather 2
```

### 参数说明

- `--input`: 输入图片路径
- `--output`: 输出透明 PNG 路径
- `--threshold`: 黑色阈值 (0-255，默认 30)
  - 值越小：只去除纯黑色
  - 值越大：去除更多深色像素（包括深灰）
- `--feather`: 边缘羽化半径（像素，默认 2）
  - 让边缘更柔和，避免锯齿

### 更新代码

处理完成后，在 `MysticalBackground.tsx` 中使用透明版本：

```typescript
// 替换
totemBottomImageSource={totemPatternBottom}
// 为
totemBottomImageSource={totemPatternBottomTransparent}
```

## 方案 2: CSS 滤镜优化（已应用）

已在 `MysticalBackground.tsx` 中添加了 CSS `filter` 优化：

- `brightness(1.1)`: 提高亮度，让深色边缘更明显
- `contrast(1.2)`: 增强对比度，让黑色边缘更易被 `mix-blend-mode: screen` 过滤

如果方案 1 的脚本无法运行，可以尝试调整这些滤镜值：

```typescript
filter: Platform.OS === 'web' ? 'brightness(1.2) contrast(1.3)' : undefined,
```

## 推荐流程

1. **先尝试方案 2**（CSS 滤镜）- 无需额外工具，已自动应用
2. **如果还有边缘问题**，使用方案 1（Python 脚本）生成透明 PNG
3. **调整参数**：如果脚本去除过多或过少，调整 `--threshold` 值
