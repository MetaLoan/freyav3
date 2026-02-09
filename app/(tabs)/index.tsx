import React, { useRef, useCallback, useState } from 'react';
import { Pressable, ScrollView as RNScrollView, ImageBackground, Image as RNImage, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
import { YStack, XStack, Text, Circle, ScrollView, Separator } from 'tamagui';
import {
  Star,
  Sun,
  Moon,
  TrendingUp,
  ChevronRight,
  Bell,
  Plus,
  Sparkles,
  Heart,
  Flame,
  Brain,
  Wind,
  Zap,
} from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaStyle } from '../../src/hooks/useSafeArea';
import { palette } from '../../src/config/theme';
import { layout } from '../../src/config/layout';
import { s, vs, fs, wp, spacing, fontSize, radius, iconSize } from '../../src/utils/responsive';
import { AppCard, Button, Avatar, Badge, MysticalBackground, TimeSelector } from '../../src/components/ui';
import type { TimeUnit } from '../../src/components/ui';
// @ts-ignore
import totemPattern from '../../assets/totem-pattern.png';
// @ts-ignore
import totemPatternBottom from '../../assets/totem-pattern-bottom.png';
// @ts-ignore
import avatarPortrait from '../../assets/avatar-portrait.png';
// @ts-ignore
import cardSolarSystemBg from '../../assets/bg.jpg';
// @ts-ignore
import dimensionSpirit from '../../assets/dimension-spirit.png';
// @ts-ignore
import dimensionMind from '../../assets/dimension-mind.png';
// @ts-ignore
import dimensionBody from '../../assets/dimension-body.png';
// @ts-ignore
import dimensionEmotion from '../../assets/dimension-emotion.png';
// @ts-ignore
import dimensionSocial from '../../assets/dimension-social.png';

/**
 * Discover / 每日洞察
 * 
 * 基于参考图重新设计的首页：
 * - 顶部积分栏
 * - 运势大图卡（Hero Card）
 * - 快捷入口（Meditation / Ritual / Fortune）
 * - 生物节律圆环
 * - 天文现象滚动
 * - 年度预测 CTA
 */

// ============================================================
// 圆环进度组件
// ============================================================

// ============================================================
// 五维运势卡片
// ============================================================

function DimensionCard({
  label,
  value,
  color,
  totemImage,
}: {
  label: string;
  value: number;
  color: string;
  totemImage: any;
}) {
  const { Image } = require('react-native');
  
  return (
    <YStack flex={1} padding={spacing.md} alignItems="center" justifyContent="space-between" position="relative">
      {/* 背景图腾 - 居中显示，100%不透明 */}
      <YStack position="absolute" top="50%" left="50%" marginLeft={-s(60)} marginTop={-s(60)}>
        <Image
          source={totemImage}
          style={{
            width: s(120),
            height: s(120),
            opacity: 1.0,
            // @ts-ignore
            mixBlendMode: 'screen',
          }}
        />
      </YStack>

      {/* 顶部：标签 + 百分比 */}
      <Text fontFamily="$body" fontSize={fs(11)} fontWeight="600" color={color} textAlign="center" numberOfLines={1}>
        {label} {value}%
      </Text>

      {/* 底部：进度条 */}
      <YStack width={s(56)} height={s(5)} borderRadius={s(3)} backgroundColor={`${color}30`} overflow="hidden">
        <YStack 
          width={`${value}%`} 
          height="100%" 
          backgroundColor={color}
        />
      </YStack>
    </YStack>
  );
}

// ============================================================
// 快捷入口瓦片
// ============================================================

function QuickTile({
  icon: Icon,
  label,
  subtitle,
  bg,
  iconColor,
  onPress,
}: {
  icon: typeof Sparkles;
  label: string;
  subtitle: string;
  bg: string;
  iconColor: string;
  onPress?: () => void;
}) {
  return (
    <AppCard variant="default" padding="sm" onPress={onPress} flex={1}>
      <YStack space={spacing.sm}>
        <Circle size={s(36)} backgroundColor={bg}>
          <Icon size={iconSize.xs} color={iconColor} />
        </Circle>
        <Text fontFamily="$body" fontSize={fontSize.sm} fontWeight="600" color={palette.textPrimary} numberOfLines={1}>
          {label}
        </Text>
        <Text fontFamily="$body" fontSize={fs(10)} color={palette.textTertiary} numberOfLines={2}>
          {subtitle}
        </Text>
      </YStack>
    </AppCard>
  );
}

// ============================================================
// 天文现象卡片
// ============================================================

// CosmicEvent 卡片外层宽度 = 2 个 DimensionCard 外层容器宽度 + 1 个间距
const DIMENSION_CARD_OUTER_W = s(120);
const COSMIC_CARD_WIDTH = DIMENSION_CARD_OUTER_W * 2 + layout.card.gap;

function CosmicEventCard({
  name,
  timeLeft,
  icon: Icon,
  color,
  description,
}: {
  name: string;
  timeLeft: string;
  icon: typeof Moon;
  color: string;
  description: string;
}) {
  return (
    <AppCard variant="default" padding="md" pressable width={COSMIC_CARD_WIDTH}>
      <YStack space={spacing.sm}>
        <XStack justifyContent="space-between" alignItems="center">
          <Circle size={s(32)} backgroundColor={`${color}15`}>
            <Icon size={iconSize.xs} color={color} />
          </Circle>
          <Text fontFamily="$mono" fontSize={fs(10)} fontWeight="600" color={color}>
            {timeLeft}
          </Text>
        </XStack>
        <Text fontFamily="$body" fontSize={fontSize.sm} fontWeight="600" color={palette.textPrimary} numberOfLines={2}>
          {name}
        </Text>
        <Text fontFamily="$body" fontSize={fs(10)} color={palette.textMuted} numberOfLines={2}>
          {description}
        </Text>
      </YStack>
    </AppCard>
  );
}

// ============================================================
// 主页面
// ============================================================

// 内容区与 Hero 的固定重叠高度
const HERO_OVERLAP = s(40);
// 默认 Hero 高度（首次渲染前的fallback）
const HERO_HEIGHT_DEFAULT = vs(480);

export default function DiscoverScreen() {
  const safeArea = useSafeAreaStyle(['top']);
  const router = useRouter();

  // 时间选择器状态
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('Day');

  // 动态测量 Hero 实际渲染高度
  const [heroHeight, setHeroHeight] = useState(HERO_HEIGHT_DEFAULT);
  const handleHeroLayout = useCallback((e: any) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setHeroHeight(h);
  }, []);

  // 动画过渡区域 = Hero 高度 - 重叠量
  const animRange = heroHeight - HERO_OVERLAP;

  // ============================================================
  // 滚动驱动动画 — 使用 CSS 自定义属性，跳过 React 渲染周期
  //
  // 旧方案（卡顿原因）：
  //   onScroll → setState → React 重渲染 → 计算样式 → DOM 更新
  //   每帧触发完整 React 渲染，60fps 下每秒 60 次重渲染
  //
  // 新方案（流畅 60fps）：
  //   onScroll → 设置 CSS 变量 --sp / --sy → 浏览器自动 calc() → GPU 合成
  //   完全跳过 React，所有动画值由浏览器原生插值
  //
  // CSS 变量说明：
  //   --sp: scroll progress (0~1)，滚动进度
  //   --sy: scroll offset Y (px)，滚动偏移量
  // ============================================================

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Platform.OS !== 'web') return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const clamped = Math.max(offsetY, 0);
    const progress = Math.min(clamped / animRange, 1);

    // 直接设置 CSS 自定义属性，浏览器通过 calc() 驱动所有动画
    // 无 setState → 无 React 重渲染 → 无 VDOM diff → 流畅 60fps
    document.documentElement.style.setProperty('--sp', progress.toFixed(4));
    document.documentElement.style.setProperty('--sy', clamped.toFixed(1));
  }, [animRange]);

  return (
    <MysticalBackground variant="full" showTotem showGlow={false} totemImageSource={totemPattern} totemBottomImageSource={totemPatternBottom}>

      {/* ===== 悬浮时间选择器 — fixed 定位在页面顶部 ===== */}
      <TimeSelector
        selectedTime={selectedTime}
        timeUnit={timeUnit}
        onTimeChange={setSelectedTime}
        onTimeUnitChange={setTimeUnit}
        safeAreaTop={safeArea.paddingTop}
      />

      {/* 所有内容都在 ScrollView 内，Hero 通过 translateY 实现半速视差 */}
      <RNScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0, // Hero 卡片从顶部开始，时间选择器沉浸式浮在上方
          paddingBottom: layout.bottomNav.height + spacing.xxl
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ===== Hero 卡片 — 在 ScrollView 内，用 CSS 变量驱动半速视差 ===== */}
        <YStack
          onLayout={handleHeroLayout}
          // @ts-ignore web-only
          style={Platform.OS === 'web' ? {
            // translateY = scrollOffsetY * 0.5
            transform: 'translateY(calc(var(--sy, 0) * 0.5 * 1px))',
            willChange: 'transform',
          } : undefined}
        >
          <YStack overflow="hidden">
            <ImageBackground
              source={cardSolarSystemBg}
              style={{ width: '100%', minHeight: '100%' }}
              resizeMode="cover"
              imageStyle={{
                ...(Platform.OS === 'web' ? {
                  width: '110%',
                  height: '110%',
                  marginLeft: '-5%',
                  marginTop: '-5%',
                  objectFit: 'cover',
                  // bgScale = (1.1 - sp * 0.1) / 1.1 = 1 - sp * 0.0909
                  // blur = sp * 12px
                  // 初始值 sp=0 → scale(1) blur(0) 即恒等变换
                  transform: 'scale(calc(1 - var(--sp, 0) * 0.0909))',
                  filter: 'blur(calc(var(--sp, 0) * 12 * 1px))',
                  willChange: 'transform, filter',
                } : {
                  width: '100%',
                  height: '100%',
                }),
              } as any}
            >
              <YStack flex={1} backgroundColor="transparent" position="relative">
                {/* 50%黑色遮罩层 */}
                <YStack
                  position="absolute" top={0} bottom={0} left={0} right={0}
                  backgroundColor="rgba(0, 0, 0, 0.50)"
                  zIndex={0}
                />
                {/* 底部渐变遮罩：透明 → 金色 */}
                <YStack
                  position="absolute" top={0} bottom={0} left={0} right={0}
                  zIndex={1}
                  // @ts-ignore web-only
                  style={{ 
                    backgroundImage: `linear-gradient(to bottom, 
                      transparent 0%, 
                      transparent 40%, 
                      rgba(122, 77, 39, 0.6) 60%, 
                      rgba(122, 77, 39, 0.9) 80%, 
                      rgba(122, 77, 39, 1) 95%,
                      #7A4D27 100%
                    )`,
                    pointerEvents: 'none',
                  }}
                />
                
                {/* 卡片内容 — 随滚动缩小 + 模糊 */}
                <YStack 
                  alignItems="center"
                  paddingHorizontal={layout.card.paddingLg} 
                  paddingTop={Platform.OS === 'web' 
                    ? 117 + spacing.md // 时间选择器高度(117px) + 间距，让内容从时间选择器下方开始
                    : safeArea.paddingTop + spacing.md
                  }
                  paddingBottom={layout.card.paddingLg + spacing.xxl}
                  space={spacing.lg}
                  zIndex={2}
                  // @ts-ignore web-only
                  style={Platform.OS === 'web' ? {
                    // scale = 1 - sp * 0.15  (1.0 → 0.85)
                    // blur  = sp * 12px      (0px → 12px)
                    // opacity = 1 - sp * 0.3 (1.0 → 0.7)
                    transform: 'scale(calc(1 - var(--sp, 0) * 0.15))',
                    filter: 'blur(calc(var(--sp, 0) * 12 * 1px))',
                    opacity: 'calc(1 - var(--sp, 0) * 0.3)',
                    transition: 'none',
                    willChange: 'transform, filter, opacity',
                  } : undefined}
                >
                  {/* 1. 头像 */}
                  <Avatar size="xl" source={avatarPortrait} showBorder={false} />

                  {/* 2. 标题 */}
                  <Text fontFamily="$heading" fontSize={fontSize.base} fontWeight="400" color={palette.gold200} textAlign="center" numberOfLines={1}>
                    Overall Energy on {selectedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>

                  {/* 3. 能量值 */}
                  <Text fontFamily="$mono" fontSize={fs(56)} fontWeight="700" color={palette.gold50}>
                    85%
                  </Text>

                  {/* 4. 描述 */}
                  <Text 
                    fontFamily="$body" 
                    fontSize={fontSize.base} 
                    color={palette.gold200} 
                    lineHeight={fs(22)} 
                    textAlign="center"
                    maxWidth={wp(80)}
                  >
                    The stars align in your favor today. Trust your intuition and embrace new opportunities that come your way.
                  </Text>

                  {/* 5. Ask Freya 按钮 — 金色渐变立体效果 + 点击动画 */}
                  <Pressable 
                    onPress={() => router.push('/chat')}
                    // @ts-ignore web-only
                    style={({ pressed }: { pressed: boolean }) => ({
                      height: s(48),
                      paddingHorizontal: s(32),
                      borderRadius: s(24),
                      backgroundImage: pressed
                        ? `linear-gradient(180deg, ${palette.gold500} 0%, ${palette.gold600} 50%, ${palette.gold800} 100%)`
                        : `linear-gradient(180deg, ${palette.gold300} 0%, ${palette.gold500} 50%, ${palette.gold700} 100%)`,
                      borderWidth: 1,
                      borderTopColor: pressed ? 'rgba(255, 248, 240, 0.15)' : 'rgba(255, 248, 240, 0.4)',
                      borderLeftColor: 'rgba(255, 248, 240, 0.15)',
                      borderRightColor: 'rgba(255, 248, 240, 0.15)',
                      borderBottomColor: 'rgba(90, 60, 30, 0.6)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: pressed
                        ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                        : '0 2px 8px rgba(196, 154, 108, 0.4), inset 0 1px 0 rgba(255, 248, 240, 0.25)',
                      transform: pressed ? 'scale(0.95)' : 'scale(1)',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease, background-image 0.1s ease',
                    })}
                  >
                    <Text fontFamily="$heading" fontSize={fs(15)} fontWeight="700" color={palette.bgDeep}>
                      Ask Freya
                    </Text>
                  </Pressable>
                </YStack>
              </YStack>
            </ImageBackground>
          </YStack>
        </YStack>

        {/* ===== 内容区：负 margin 向上重叠 Hero，自然盖住 Hero ===== */}
        <YStack
          position="relative"
          zIndex={1}
          borderTopLeftRadius={s(24)}
          borderTopRightRadius={s(24)}
          borderTopWidth={1}
          borderColor={palette.gold500}
          marginTop={-HERO_OVERLAP}
          // @ts-ignore
          style={{
            backgroundImage: `linear-gradient(to bottom, 
              ${palette.bgDeep} 0%, 
              ${palette.bgDeep} 50%, 
              rgba(19, 17, 16, 0.6) 70%, 
              transparent 85%
            )`,
          }}
        >

          {/* ===== 五维运势 ===== */}
          <YStack marginTop={spacing.lg}>
            <XStack justifyContent="space-between" alignItems="center" marginBottom={spacing.md} paddingHorizontal={layout.page.paddingH}>
              <Text fontFamily="$heading" fontSize={fontSize.xl} fontWeight="700" color={palette.textPrimary}>
                Five Dimensions
              </Text>
            </XStack>

            {/* 横向滚动的5张卡片 */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: layout.page.paddingH, gap: layout.card.gap }}
            >
              {/* Spirit */}
              <YStack
                width={s(120)}
                height={s(140)}
                borderRadius={s(20)}
                overflow="hidden"
                // @ts-ignore
                style={{ 
                  backgroundImage: `linear-gradient(180deg, ${palette.gold400} 0%, ${palette.gold500} 40%, ${palette.gold700} 100%)`,
                }}
              >
                <DimensionCard label="Spirit" value={82} color={palette.gold200} totemImage={dimensionSpirit} />
              </YStack>

              {/* Mind */}
              <YStack
                width={s(120)}
                height={s(140)}
                borderRadius={s(20)}
                overflow="hidden"
                // @ts-ignore
                style={{ 
                  backgroundImage: `linear-gradient(180deg, ${palette.royal400} 0%, ${palette.royal500} 40%, ${palette.royal700} 100%)`,
                }}
              >
                <DimensionCard label="Mind" value={65} color={palette.gold200} totemImage={dimensionMind} />
              </YStack>

              {/* Body */}
              <YStack
                width={s(120)}
                height={s(140)}
                borderRadius={s(20)}
                overflow="hidden"
                // @ts-ignore
                style={{ 
                  backgroundImage: `linear-gradient(180deg, ${palette.coral400} 0%, ${palette.coral500} 40%, ${palette.coral700} 100%)`,
                }}
              >
                <DimensionCard label="Body" value={91} color={palette.gold200} totemImage={dimensionBody} />
              </YStack>

              {/* Emotion */}
              <YStack
                width={s(120)}
                height={s(140)}
                borderRadius={s(20)}
                overflow="hidden"
                // @ts-ignore
                style={{ 
                  backgroundImage: `linear-gradient(180deg, #A855F7 0%, #8B5CF6 40%, #6D28D9 100%)`,
                }}
              >
                <DimensionCard label="Emotion" value={74} color={palette.gold200} totemImage={dimensionEmotion} />
              </YStack>

              {/* Social */}
              <YStack
                width={s(120)}
                height={s(140)}
                borderRadius={s(20)}
                overflow="hidden"
                // @ts-ignore
                style={{ 
                  backgroundImage: `linear-gradient(180deg, #10B981 0%, #059669 40%, #047857 100%)`,
                }}
              >
                <DimensionCard label="Social" value={88} color={palette.gold200} totemImage={dimensionSocial} />
              </YStack>
            </ScrollView>
          </YStack>

          {/* ===== 天文现象 ===== */}
          <YStack marginTop={layout.page.sectionGap}>
            <XStack paddingHorizontal={layout.page.paddingH} justifyContent="space-between" alignItems="center" marginBottom={spacing.md}>
              <Text fontFamily="$heading" fontSize={fontSize.xl} fontWeight="700" color={palette.textPrimary}>
                Cosmic Events
              </Text>
              <Pressable>
                <Text fontFamily="$body" fontSize={fontSize.sm} color={palette.gold400}>
                  See all →
                </Text>
              </Pressable>
            </XStack>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: layout.page.paddingH, gap: layout.card.gap }}
            >
              <CosmicEventCard name="Mercury Retrograde" timeLeft="ends 54d" icon={TrendingUp} color={palette.coral400} description="Communication may face challenges" />
              <CosmicEventCard name="Full Moon in Leo" timeLeft="in 3d" icon={Moon} color={palette.gold400} description="Emotions heightened, time for release" />
              <CosmicEventCard name="Venus in Pisces" timeLeft="ends 12d" icon={Heart} color={palette.royal400} description="Romance and creativity flourish" />
              <CosmicEventCard name="Mars in Cancer" timeLeft="ends 28d" icon={Flame} color="#4CAF7D" description="Nurturing energy, protect what matters" />
            </ScrollView>
          </YStack>

          {/* ===== Ask a Consultant ===== */}
          <YStack paddingHorizontal={layout.page.paddingH} marginTop={layout.page.sectionGap} paddingBottom={spacing.xl}>
            <AppCard variant="default" padding="lg" onPress={() => router.push('/chat')}>
              <XStack alignItems="center" space={spacing.base}>
                <YStack flex={1} space={spacing.xs}>
                  <Text fontFamily="$heading" fontSize={fontSize.h3} fontWeight="700" color={palette.gold300}>
                    Ask a Consultant
                  </Text>
                  <Text fontFamily="$body" fontSize={fontSize.sm} color={palette.textTertiary} lineHeight={fs(18)}>
                    Answers to all your questions about biorhythms
                  </Text>
                </YStack>
                <Circle size={s(48)} backgroundColor={palette.gold900} borderWidth={1} borderColor={palette.borderGold}>
                  <ChevronRight size={iconSize.base} color={palette.gold400} />
                </Circle>
              </XStack>
            </AppCard>
          </YStack>

        </YStack>
      </RNScrollView>
    </MysticalBackground>
  );
}
