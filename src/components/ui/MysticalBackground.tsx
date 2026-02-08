import React from 'react';
import { Dimensions, Platform, Image } from 'react-native';
import { YStack } from 'tamagui';
import Svg, {
  Circle as SvgCircle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  G,
  Line,
  Polygon,
  FeGaussianBlur,
  Filter,
  Mask,
  Image as SvgImage,
  Use,
} from 'react-native-svg';
import { palette } from '../../config/theme';
import { s, screenWidth, screenHeight } from '../../utils/responsive';
import { layout } from '../../config/layout';

/**
 * 神秘背景组件
 * 
 * 参考图中的背景设计元素：
 * 1. 温暖的辐射光晕（金色/琥珀色径向渐变）
 * 2. 金色星座线描图腾（太阳放射线、月相、星星、圆环）
 * 3. 整体营造"高端占星沙龙"的氛围
 */

type BackgroundVariant = 'full' | 'top' | 'center' | 'overlay';

interface MysticalBackgroundProps {
  /** 变体 */
  variant?: BackgroundVariant;
  /** 是否显示图腾纹样 */
  showTotem?: boolean;
  /** 是否显示发光效果 */
  showGlow?: boolean;
  /** 光晕颜色 */
  glowColor?: string;
  /** 光晕强度 (0-1) */
  glowIntensity?: number;
  /** 图腾图片路径（如果提供，将使用图片替代 SVG） */
  totemImageSource?: any;
  /** 底部图腾图片路径 */
  totemBottomImageSource?: any;
  /** 子内容（variant='full' 时） */
  children?: React.ReactNode;
}

// ============================================================
// 图腾装饰（图片或 SVG）
// ============================================================

function TotemPattern({ 
  width, 
  height, 
  opacity = 1.0,
  imageSource,
  lightMaskId,
  position = 'top',
}: { 
  width: number; 
  height: number; 
  opacity?: number;
  imageSource?: any;
  lightMaskId?: string;
  position?: 'top' | 'bottom';
}) {
  // 如果提供了图片，使用图片（带遮罩效果）
  if (imageSource) {
    // 如果提供了 lightMaskId，使用“开洞”遮罩效果
    if (lightMaskId) {
      const isBottom = position === 'bottom';
      const bottomNavHeight = layout.bottomNav.height + layout.bottomNav.paddingBottom;
      const topValue = isBottom ? undefined : 0;
      const bottomValue = isBottom ? -bottomNavHeight : undefined;
      // 底部图腾向下移动一半后，遮罩圆形应该在图片的下半部分（底部）显示
      // 由于遮罩 SVG 也向下移动了 width/2，所以 cy 调整为 width/2（相对于移动后的坐标系）
      const circleCy = isBottom ? width / 2 : 0;
      
      return (
        <YStack
          position="absolute"
          top={topValue}
          bottom={bottomValue}
          left={0}
          width={width}
          height={width} // 使用宽度作为高度，保持 1:1 比例显示完整图腾
          overflow="hidden"
        >
          {/* 1. 底层：图腾图片（全屏显示，使用滤色混合模式） */}
          {/* 底部图腾向下移动图片高度的一半，只露出一半 */}
          <Image
            source={imageSource}
            resizeMode="contain"
            style={{
              width: width,
              height: width,
              opacity: opacity,
              // @ts-ignore - React Native Web 支持 blendMode
              mixBlendMode: 'screen',
              // 底部图腾向下移动一半，只露出一半
              ...(isBottom ? { marginTop: width / 2 } : {}),
            }}
          />
          
          {/* 2. 顶层遮罩：背景色底板 + 高斯模糊的“洞” */}
          {/* 底部图腾的遮罩也需要向下移动一半，与图片对齐 */}
          <Svg
            width={width}
            height={width}
            viewBox={`0 0 ${width} ${width}`}
            style={{ 
              position: 'absolute', 
              top: isBottom ? width / 2 : 0, 
              left: 0 
            }}
          >
            <Defs>
              {/* 定义“洞”的形状和模糊效果 */}
              <Filter id={`hole-blur-${lightMaskId}`} x="-50%" y="-50%" width="200%" height="200%">
                <FeGaussianBlur in="SourceGraphic" stdDeviation="60" />
              </Filter>
              
              {/* 定义遮罩：白色部分不透明（显示遮挡层），黑色部分透明（显示底层图腾） */}
              <Mask id={`hole-mask-${lightMaskId}`}>
                {/* 默认全白（完全遮挡） */}
                <rect x="0" y="0" width={width} height={width} fill="white" />
                
                {/* 在中间挖一个黑色的洞（显示图腾），带模糊边缘 */}
                {/* 底部图腾：图片向下移动一半后，圆形应该在图片的下半部分（底部）显示 */}
                {/* 由于遮罩 SVG 也向下移动了 width/2，圆形的 cy 需要调整为 0（相对于移动后的坐标系，对应图片底部） */}
                <SvgCircle
                  cx={width / 2}
                  cy={isBottom ? 0 : circleCy}
                  r={width * 0.4}
                  fill="black"
                  filter={`url(#hole-blur-${lightMaskId})`}
                />
              </Mask>
            </Defs>
            
            {/* 遮挡层：使用背景色，应用挖洞遮罩 */}
            <rect
              x="0"
              y="0"
              width={width}
              height={width}
              fill={palette.bgDeep} // 使用与页面背景一致的颜色
              mask={`url(#hole-mask-${lightMaskId})`}
            />
          </Svg>
        </YStack>
      );
    }
    
    // 没有遮罩时，使用普通 Image + 滤色混合
    return (
      <Image
        source={imageSource}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: width, // 使用宽度作为高度
          opacity: opacity,
          // @ts-ignore - React Native Web 支持 blendMode
          mixBlendMode: 'screen',
        }}
      />
    );
  }

  // 否则使用 SVG
  const cx = width / 2;
  // 将中心点上移到页面顶部区域（15% 高度处）
  const cy = height * 0.15;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <G opacity={opacity} stroke={palette.gold400} strokeWidth={1} fill="none">
        {/* 中心太阳放射线 */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15) * Math.PI / 180;
          const innerR = s(40);
          const outerR = s(100) + (i % 2 === 0 ? s(30) : 0);
          return (
            <Line
              key={`ray-${i}`}
              x1={cx + Math.cos(angle) * innerR}
              y1={cy + Math.sin(angle) * innerR}
              x2={cx + Math.cos(angle) * outerR}
              y2={cy + Math.sin(angle) * outerR}
              strokeWidth={1}
            />
          );
        })}

        {/* 中心同心圆 */}
        <SvgCircle cx={cx} cy={cy} r={s(35)} strokeWidth={1} />
        <SvgCircle cx={cx} cy={cy} r={s(55)} strokeWidth={1} strokeDasharray="6,8" />
        <SvgCircle cx={cx} cy={cy} r={s(95)} strokeWidth={1} strokeDasharray="4,10" />
        <SvgCircle cx={cx} cy={cy} r={s(130)} strokeWidth={1} strokeDasharray="2,15" />

        {/* 月相装饰（左侧对称） */}
        <SvgCircle cx={s(60)} cy={cy} r={s(15)} strokeWidth={1} />
        <Path d={`M ${s(60) - s(6)} ${cy - s(15)} A ${s(10)} ${s(15)} 0 0 1 ${s(60) - s(6)} ${cy + s(15)}`} strokeWidth={1} fill={`${palette.gold400}20`} />

        {/* 月相装饰（右侧对称） */}
        <SvgCircle cx={width - s(60)} cy={cy} r={s(12)} strokeWidth={1} />
        <Path d={`M ${width - s(60) + s(3)} ${cy - s(12)} A ${s(8)} ${s(12)} 0 0 0 ${width - s(60) + s(3)} ${cy + s(12)}`} strokeWidth={1} fill={`${palette.gold400}20`} />

        {/* 小星星散布 - 集中在中心图腾周围 */}
        {[
          { x: cx - s(120), y: cy - s(80) },
          { x: cx + s(120), y: cy - s(100) },
          { x: cx - s(100), y: cy + s(120) },
          { x: cx + s(110), y: cy + s(90) },
          { x: cx, y: cy - s(160) },
        ].map((star, i) => (
          <G key={`star-${i}`} opacity={0.8}>
            <Line x1={star.x} y1={star.y - s(6)} x2={star.x} y2={star.y + s(6)} strokeWidth={1} />
            <Line x1={star.x - s(6)} y1={star.y} x2={star.x + s(4)} y2={star.y} strokeWidth={1} />
          </G>
        ))}

        {/* 装饰性弧线 - 承托中心 */}
        <Path
          d={`M ${s(40)} ${cy + s(180)} Q ${cx} ${cy + s(220)} ${width - s(40)} ${cy + s(180)}`}
          strokeWidth={1}
          strokeDasharray="4,12"
        />

        {/* 小圆点散布 */}
        {[
          { x: s(100), y: s(60) },
          { x: width - s(100), y: s(180) },
          { x: s(60), y: height * 0.5 },
          { x: width - s(50), y: height * 0.45 },
          { x: cx + s(40), y: s(160) },
        ].map((dot, i) => (
          <SvgCircle key={`dot-${i}`} cx={dot.x} cy={dot.y} r={s(2)} fill={`${palette.gold400}15`} />
        ))}
      </G>
    </Svg>
  );
}

// ============================================================
// 光晕效果 SVG
// ============================================================

function GlowEffect({
  width,
  height,
  color = palette.gold700,
  intensity = 0.15,
  variant = 'top',
}: {
  width: number;
  height: number;
  color?: string;
  intensity?: number;
  variant?: BackgroundVariant;
}) {
  // 根据变体确定光晕位置
  const glowPositions = {
    full: [
      { cx: width * 0.5, cy: height * 0.2, r: width * 0.8 },
      { cx: width * 0.1, cy: height * 0.5, r: width * 0.5 },
      { cx: width * 0.9, cy: height * 0.8, r: width * 0.4 },
    ],
    top: [
      { cx: width * 0.5, cy: 0, r: width * 0.9 },
      { cx: width * 0.1, cy: height * 0.2, r: width * 0.4 },
    ],
    center: [
      { cx: width * 0.5, cy: height * 0.4, r: width * 0.7 },
    ],
    overlay: [
      { cx: width * 0.5, cy: height * 0.3, r: width * 0.8 },
    ],
  };

  const positions = glowPositions[variant];

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Defs>
        {positions.map((_, i) => (
          <RadialGradient key={`glow-grad-${i}`} id={`glow-${i}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={intensity} />
            <Stop offset="50%" stopColor={color} stopOpacity={intensity * 0.4} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {positions.map((pos, i) => (
        <SvgCircle
          key={`glow-${i}`}
          cx={pos.cx}
          cy={pos.cy}
          r={pos.r}
          fill={`url(#glow-${i})`}
        />
      ))}
    </Svg>
  );
}

// ============================================================
// 主组件
// ============================================================

export const MysticalBackground: React.FC<MysticalBackgroundProps> = ({
  variant = 'full',
  showTotem = true,
  showGlow = true,
  glowColor = palette.gold700,
  glowIntensity = 0.12,
  totemImageSource,
  totemBottomImageSource,
  children,
}) => {
  const width = screenWidth;
  const height = screenHeight;
  const bottomNavHeight = layout.bottomNav.height + layout.bottomNav.paddingBottom;

  // 作为容器包裹子内容
  return (
    <YStack flex={1} backgroundColor={palette.bgDeep}>
      {/* 背景层 */}
      <YStack position="absolute" top={0} left={0} right={0} bottom={0} style={{ pointerEvents: 'none' }}>
        {/* 顶部光照区域（圆形，用作光照遮罩） */}
        <Svg width={width} height={600} viewBox={`0 0 ${width} 600`} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Defs>
            <Filter id="blur-top" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur in="SourceGraphic" stdDeviation="50" />
            </Filter>
            {/* 顶部光照遮罩：圆形渐变 */}
            <RadialGradient id="light-mask-gradient-top" cx="50%" cy="0%" r="80%">
              <Stop offset="0%" stopColor="white" stopOpacity="1" />
              <Stop offset="40%" stopColor="white" stopOpacity="0.8" />
              <Stop offset="70%" stopColor="white" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="black" stopOpacity="0" />
            </RadialGradient>
            {/* 顶部光照遮罩形状 */}
            <g id="light-mask-shape-top">
              <SvgCircle
                cx={width / 2}
                cy={0}
                r={width * 0.4}
                fill="url(#light-mask-gradient-top)"
                opacity={1}
                filter="url(#blur-top)"
              />
            </g>
          </Defs>
          {/* 显示顶部圆形（用于调试和视觉效果） */}
          <SvgCircle
            cx={width / 2}
            cy={0}
            r={width * 0.4}
            fill={palette.gold300}
            opacity={0.3}
            filter="url(#blur-top)"
          />
        </Svg>

        {/* 底部光照区域（圆形，用作光照遮罩） */}
        <Svg width={width} height={600} viewBox={`0 0 ${width} 600`} style={{ position: 'absolute', bottom: -bottomNavHeight, left: 0 }}>
          <Defs>
            <Filter id="blur-bottom" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur in="SourceGraphic" stdDeviation="50" />
            </Filter>
            {/* 底部光照遮罩：圆形渐变（从底部向上） */}
            <RadialGradient id="light-mask-gradient-bottom" cx="50%" cy="100%" r="80%">
              <Stop offset="0%" stopColor="white" stopOpacity="1" />
              <Stop offset="40%" stopColor="white" stopOpacity="0.8" />
              <Stop offset="70%" stopColor="white" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="black" stopOpacity="0" />
            </RadialGradient>
            {/* 底部光照遮罩形状 */}
            <g id="light-mask-shape-bottom">
              <SvgCircle
                cx={width / 2}
                cy={600}
                r={width * 0.4}
                fill="url(#light-mask-gradient-bottom)"
                opacity={1}
                filter="url(#blur-bottom)"
              />
            </g>
          </Defs>
          {/* 显示底部圆形（用于调试和视觉效果） */}
          <SvgCircle
            cx={width / 2}
            cy={600}
            r={width * 0.4}
            fill={palette.gold300}
            opacity={0.3}
            filter="url(#blur-bottom)"
          />
        </Svg>

        {showGlow && (
          <GlowEffect
            width={width}
            height={height}
            color={glowColor}
            intensity={glowIntensity}
            variant={variant}
          />
        )}
        {showTotem && totemImageSource && (
          <TotemPattern 
            width={width} 
            height={height} 
            opacity={0.5}
            imageSource={totemImageSource}
            lightMaskId="light-mask-shape-top"
            position="top"
          />
        )}
        {showTotem && totemBottomImageSource && (
          <TotemPattern 
            width={width} 
            height={height} 
            opacity={0.5}
            imageSource={totemBottomImageSource}
            lightMaskId="light-mask-shape-bottom"
            position="bottom"
          />
        )}
      </YStack>

      {/* 内容层 */}
      {children}
    </YStack>
  );
};
