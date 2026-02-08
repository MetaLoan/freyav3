import { createTokens } from 'tamagui';

/**
 * Freya V3 设计系统 - "Mystical Luxury" 主题
 * 
 * 基于参考图拆解的视觉规范：
 * - 极深暖棕背景 + 金色主调 + 皇家蓝辅助 + 珊瑚橙强调
 * - 大圆角卡片 + 玻璃拟态 + 月相/星芒装饰
 * - 衬线标题 + 无衬线正文
 */

// ============================================================
// 颜色常量（不直接用于组件，通过 themes 引用）
// ============================================================

export const palette = {
  // === 背景层级 ===
  bgDeepest: '#0D0B0A',       // 最深层背景
  bgDeep: '#131110',          // 主页面背景
  bgBase: '#1A1614',          // 标准背景
  bgElevated: '#221E1A',      // 抬升层（卡片底层）
  bgSurface: '#2A2420',       // 卡片/表面
  bgSurfaceHover: '#352E28',  // 卡片 hover 态
  bgOverlay: 'rgba(42, 36, 32, 0.85)', // 半透明遮罩

  // === 金色系 (Primary) ===
  gold50: '#FFF8F0',
  gold100: '#F5E6D0',
  gold200: '#E8CCA5',
  gold300: '#D4A574',         // 金色渐变亮端
  gold400: '#C49A6C',         // 金色主色
  gold500: '#B08A5C',         // 金色标准
  gold600: '#9A744A',         // 金色深
  gold700: '#7A5A38',
  gold800: '#5C4228',
  gold900: '#3E2C1A',

  // === 皇家蓝系 (Secondary) ===
  royal50: '#E8ECF8',
  royal100: '#C5CCE8',
  royal200: '#8A96CC',
  royal300: '#5B6BB5',
  royal400: '#3B4DAA',        // 皇家蓝标准
  royal500: '#2D3A8C',        // 皇家蓝深
  royal600: '#242F72',
  royal700: '#1C245A',
  royal800: '#141A42',
  royal900: '#0C102A',

  // === 珊瑚橙系 (Accent) ===
  coral50: '#FFF0EC',
  coral100: '#FFD5CA',
  coral200: '#FFB09E',
  coral300: '#FF8A72',
  coral400: '#FF6B4A',        // 珊瑚橙标准
  coral500: '#E85D3A',        // 珊瑚橙深
  coral600: '#CC4A2E',
  coral700: '#A33824',
  coral800: '#7A2A1A',
  coral900: '#521C12',

  // === 文字色 ===
  textPrimary: '#F5F0EB',     // 主文字 - 暖米白
  textSecondary: '#B8B0A8',   // 次要文字
  textTertiary: '#8A8480',    // 辅助文字
  textMuted: '#5A5550',       // 静默文字
  textOnGold: '#1A1614',      // 金色按钮上的深色文字
  textOnBlue: '#E8ECF8',      // 蓝色卡片上的浅色文字

  // === 功能色 ===
  success: '#4CAF7D',
  warning: '#E8A73E',
  error: '#E85D3A',
  info: '#3B4DAA',

  // === 边框/分割线 ===
  border: 'rgba(245, 240, 235, 0.08)',        // 微妙边框
  borderLight: 'rgba(245, 240, 235, 0.12)',   // 轻边框
  borderGold: 'rgba(196, 154, 108, 0.3)',     // 金色边框
  borderBlue: 'rgba(59, 77, 170, 0.4)',       // 蓝色边框

  // === 透明度层 ===
  white5: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.10)',
  white15: 'rgba(255, 255, 255, 0.15)',
  white20: 'rgba(255, 255, 255, 0.20)',
  black50: 'rgba(0, 0, 0, 0.50)',
  black70: 'rgba(0, 0, 0, 0.70)',
} as const;

// ============================================================
// Tamagui Themes（暗色为主，浅色备用）
// ============================================================

export const themes = {
  // ----- 暗色主题（默认） -----
  dark: {
    background: palette.bgDeep,
    backgroundHover: palette.bgElevated,
    backgroundPress: palette.bgBase,
    backgroundFocus: palette.bgElevated,
    backgroundStrong: palette.bgDeepest,
    backgroundTransparent: 'transparent',

    color: palette.textPrimary,
    colorHover: palette.gold300,
    colorPress: palette.gold400,
    colorFocus: palette.textSecondary,
    colorTransparent: 'transparent',

    borderColor: palette.border,
    borderColorHover: palette.borderLight,
    borderColorPress: palette.borderGold,
    borderColorFocus: palette.borderGold,

    placeholderColor: palette.textMuted,
    outlineColor: palette.gold400,

    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowColorHover: 'rgba(0, 0, 0, 0.6)',
    shadowColorPress: 'rgba(0, 0, 0, 0.7)',
    shadowColorFocus: 'rgba(196, 154, 108, 0.15)',

    // 自定义语义 tokens
    surfaceBackground: palette.bgSurface,
    cardBackground: palette.bgSurface,
    cardBackgroundHover: palette.bgSurfaceHover,
    overlayBackground: palette.bgOverlay,

    accentColor: palette.gold400,
    accentColorHover: palette.gold300,

    secondaryColor: palette.royal400,
    secondaryBackground: palette.royal500,

    highlightColor: palette.coral400,
    highlightBackground: palette.coral500,
  },

  // ----- 浅色主题（备用，后续可扩展） -----
  light: {
    background: '#FAF8F5',
    backgroundHover: '#F0ECE6',
    backgroundPress: '#E8E2DA',
    backgroundFocus: '#F0ECE6',
    backgroundStrong: '#FFFFFF',
    backgroundTransparent: 'transparent',

    color: '#1A1614',
    colorHover: palette.gold600,
    colorPress: palette.gold700,
    colorFocus: '#5A5550',
    colorTransparent: 'transparent',

    borderColor: 'rgba(26, 22, 20, 0.08)',
    borderColorHover: 'rgba(26, 22, 20, 0.12)',
    borderColorPress: palette.borderGold,
    borderColorFocus: palette.borderGold,

    placeholderColor: '#B8B0A8',
    outlineColor: palette.gold500,

    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowColorHover: 'rgba(0, 0, 0, 0.12)',
    shadowColorPress: 'rgba(0, 0, 0, 0.15)',
    shadowColorFocus: 'rgba(196, 154, 108, 0.1)',

    surfaceBackground: '#FFFFFF',
    cardBackground: '#FFFFFF',
    cardBackgroundHover: '#F5F0EB',
    overlayBackground: 'rgba(250, 248, 245, 0.9)',

    accentColor: palette.gold500,
    accentColorHover: palette.gold400,

    secondaryColor: palette.royal400,
    secondaryBackground: palette.royal100,

    highlightColor: palette.coral500,
    highlightBackground: palette.coral100,
  },
} as const;

// ============================================================
// 设计规范常量（供组件使用）
// ============================================================

/** 卡片圆角 */
export const CARD_RADIUS = 20;

/** 按钮圆角 */
export const BUTTON_RADIUS = 16;

/** 头像尺寸 */
export const AVATAR_SIZES = {
  sm: 32,
  md: 48,
  lg: 72,
  xl: 96,
} as const;

/** 头像金色边框宽度 */
export const AVATAR_BORDER_WIDTH = 2;

/** 底部导航高度 */
export const BOTTOM_NAV_HEIGHT = 72;

/** 底部导航图标尺寸 */
export const NAV_ICON_SIZE = 48;
