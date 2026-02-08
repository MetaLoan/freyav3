import { Dimensions, Platform, PixelRatio } from 'react-native';

/**
 * Freya V3 响应式缩放系统
 * 
 * 基于屏幕宽度按比例缩放所有尺寸值，确保不同设备上的视觉比例一致。
 * 
 * 设计基准：375dp（iPhone 标准宽度）
 * 
 * 示例效果：
 * - iPhone SE (320dp):    fontSize 16 → 13.7
 * - iPhone 16 (393dp):    fontSize 16 → 16.8
 * - iPhone 16 PM (430dp): fontSize 16 → 最大 18.4（有上限）
 * - iPad (768dp):         fontSize 16 → 最大 18.4（超宽屏不无限放大）
 * 
 * 使用方式：
 * ```tsx
 * import { s, fs, wp, hp } from '@/utils/responsive';
 * 
 * <YStack padding={s(16)} borderRadius={s(20)}>
 *   <Text fontSize={fs(24)}>标题</Text>
 *   <View width={wp(90)} />  // 90% 屏幕宽度
 * </YStack>
 * ```
 */

// ============================================================
// 屏幕基本参数
// ============================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** 设计稿基准宽度（iPhone 标准） */
const DESIGN_WIDTH = 375;

/** 设计稿基准高度 */
const DESIGN_HEIGHT = 812;

/** 
 * 缩放比例 = 当前屏幕宽度 / 设计基准宽度
 * 限制范围：0.8 ~ 1.2，防止极端设备上过小/过大
 */
const SCALE_RATIO = Math.min(Math.max(SCREEN_WIDTH / DESIGN_WIDTH, 0.8), 1.2);

/** 
 * 垂直缩放比例（用于需要考虑屏幕高度的场景）
 * 限制范围：0.85 ~ 1.15
 */
const VERTICAL_SCALE_RATIO = Math.min(Math.max(SCREEN_HEIGHT / DESIGN_HEIGHT, 0.85), 1.15);

/** 
 * 字体缩放比例
 * 比通用缩放更保守，避免文字过大/过小影响阅读
 * 使用宽度缩放的 0.8 次方来"压缩"变化幅度
 */
const FONT_SCALE_RATIO = Math.pow(SCALE_RATIO, 0.8);

// ============================================================
// 核心缩放函数
// ============================================================

/**
 * s (scale) - 通用尺寸缩放
 * 
 * 用于：padding / margin / borderRadius / icon size / gap 等
 * 
 * @param size 设计稿上的尺寸值（基于 375dp 宽度）
 * @returns 适配当前屏幕的缩放值
 * 
 * @example
 * <YStack padding={s(16)} borderRadius={s(20)} gap={s(12)} />
 */
export function s(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * SCALE_RATIO));
}

/**
 * vs (vertical scale) - 垂直方向缩放
 * 
 * 用于：高度相关的尺寸（如卡片高度、垂直间距）
 * 比水平缩放更保守，因为屏幕高度差异比宽度大
 * 
 * @param size 设计稿上的垂直尺寸值
 * @returns 适配当前屏幕的垂直缩放值
 * 
 * @example
 * <Card height={vs(200)} />
 */
export function vs(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * VERTICAL_SCALE_RATIO));
}

/**
 * fs (font scale) - 字体大小缩放
 * 
 * 比通用缩放更保守，确保文字在各种屏幕上都清晰可读。
 * 使用 SCALE_RATIO^0.8 压缩变化幅度。
 * 
 * @param size 设计稿上的字号（基于 375dp 宽度）
 * @returns 适配当前屏幕的字号
 * 
 * @example
 * <Text fontSize={fs(16)}>正文</Text>
 * <H1 fontSize={fs(32)}>标题</H1>
 */
export function fs(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * FONT_SCALE_RATIO));
}

/**
 * ms (moderate scale) - 温和缩放
 * 
 * 在固定值和完全缩放之间的折中方案。
 * factor = 0 时完全不缩放，factor = 1 时等同于 s()
 * 
 * @param size 设计稿上的尺寸值
 * @param factor 缩放因子 (0-1)，默认 0.5
 * @returns 适配当前屏幕的温和缩放值
 * 
 * @example
 * // 图标大小：只做 50% 缩放，避免太大/太小
 * <Icon size={ms(24, 0.5)} />
 */
export function ms(size: number, factor: number = 0.5): number {
  return Math.round(
    PixelRatio.roundToNearestPixel(size + (s(size) - size) * factor)
  );
}

/**
 * wp (width percentage) - 屏幕宽度百分比
 * 
 * @param percentage 屏幕宽度的百分比 (0-100)
 * @returns 对应的像素值
 * 
 * @example
 * <Card width={wp(90)} />  // 90% 屏幕宽度
 */
export function wp(percentage: number): number {
  return Math.round(PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100));
}

/**
 * hp (height percentage) - 屏幕高度百分比
 * 
 * @param percentage 屏幕高度的百分比 (0-100)
 * @returns 对应的像素值
 * 
 * @example
 * <View height={hp(50)} />  // 50% 屏幕高度
 */
export function hp(percentage: number): number {
  return Math.round(PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100));
}

// ============================================================
// 屏幕信息
// ============================================================

/** 当前屏幕宽度 (dp) */
export const screenWidth = SCREEN_WIDTH;

/** 当前屏幕高度 (dp) */
export const screenHeight = SCREEN_HEIGHT;

/** 当前缩放比例 */
export const scaleRatio = SCALE_RATIO;

/** 是否为小屏设备 (宽度 < 350dp) */
export const isSmallScreen = SCREEN_WIDTH < 350;

/** 是否为大屏设备 (宽度 > 420dp) */
export const isLargeScreen = SCREEN_WIDTH > 420;

/** 是否为平板设备 (宽度 > 600dp) */
export const isTablet = SCREEN_WIDTH > 600;

// ============================================================
// 预生成的响应式尺寸常量（高频使用，避免重复计算）
// ============================================================

/** 响应式间距 */
export const spacing = {
  /** 4dp */ xs: s(4),
  /** 8dp */ sm: s(8),
  /** 12dp */ md: s(12),
  /** 16dp */ base: s(16),
  /** 20dp */ lg: s(20),
  /** 24dp */ xl: s(24),
  /** 32dp */ xxl: s(32),
  /** 40dp */ xxxl: s(40),
} as const;

/** 响应式字号 */
export const fontSize = {
  /** 11dp */ xs: fs(11),
  /** 12dp */ sm: fs(12),
  /** 14dp */ base: fs(14),
  /** 16dp */ md: fs(16),
  /** 18dp */ lg: fs(18),
  /** 20dp */ xl: fs(20),
  /** 24dp */ h3: fs(24),
  /** 28dp */ h2: fs(28),
  /** 32dp */ h1: fs(32),
  /** 40dp */ display: fs(40),
} as const;

/** 响应式圆角 */
export const radius = {
  /** 8dp */ sm: s(8),
  /** 12dp */ md: s(12),
  /** 16dp */ base: s(16),
  /** 20dp */ lg: s(20),
  /** 24dp */ xl: s(24),
  /** 9999 */ full: 9999,
} as const;

/** 响应式图标尺寸 */
export const iconSize = {
  /** 16dp */ xs: ms(16, 0.5),
  /** 20dp */ sm: ms(20, 0.5),
  /** 24dp */ base: ms(24, 0.5),
  /** 28dp */ md: ms(28, 0.5),
  /** 32dp */ lg: ms(32, 0.5),
  /** 48dp */ xl: ms(48, 0.5),
} as const;
