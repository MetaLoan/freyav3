import { createFont } from 'tamagui';

/**
 * Freya V3 字体配置
 * 
 * 设计规范：
 * - heading: Playfair Display（衬线体） - 用于大标题/页面标题，体现奢华感
 * - body: Inter（无衬线体） - 用于正文/UI 元素，保证可读性
 * - mono: 系统等宽字体 - 用于数字展示/代码
 */

/** 标题字体 - Playfair Display（衬线体，神秘奢华感） */
export const headingFont = createFont({
  family: 'PlayfairDisplay',
  size: {
    1: 11,
    2: 13,
    3: 15,
    4: 17,
    true: 20,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
    11: 56,
    12: 64,
  },
  lineHeight: {
    1: 16,
    2: 19,
    3: 22,
    4: 24,
    true: 28,
    5: 28,
    6: 32,
    7: 36,
    8: 40,
    9: 48,
    10: 56,
    11: 64,
    12: 72,
  },
  weight: {
    4: '400',
    true: '700',
    5: '500',
    6: '600',
    7: '700',
    8: '800',
    9: '900',
  },
  letterSpacing: {
    4: 0,
    true: -0.3,
    5: -0.3,
    6: -0.5,
    7: -0.6,
    8: -0.8,
    9: -1,
    10: -1.2,
  },
  face: {
    400: { normal: 'Playfair Display' },
    500: { normal: 'Playfair Display' },
    600: { normal: 'Playfair Display' },
    700: { normal: 'Playfair Display' },
    800: { normal: 'Playfair Display' },
    900: { normal: 'Playfair Display' },
  },
});

/** 正文字体 - Inter（无衬线体，清晰可读） */
export const bodyFont = createFont({
  family: 'Inter',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    true: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 23,
    9: 30,
    10: 46,
  },
  lineHeight: {
    1: 15,
    2: 17,
    3: 19,
    4: 21,
    true: 21,
    5: 24,
    6: 27,
    7: 30,
    8: 33,
    9: 40,
    10: 55,
  },
  weight: {
    1: '100',
    2: '200',
    3: '300',
    4: '400',
    true: '400',
    5: '500',
    6: '600',
    7: '700',
    8: '800',
    9: '900',
  },
  letterSpacing: {
    4: 0,
    true: 0,
    5: -0.2,
    6: -0.3,
    7: -0.4,
    8: -0.5,
    9: -0.8,
  },
  face: {
    100: { normal: 'Inter' },
    200: { normal: 'Inter' },
    300: { normal: 'Inter' },
    400: { normal: 'Inter' },
    500: { normal: 'Inter' },
    600: { normal: 'Inter' },
    700: { normal: 'Inter' },
    800: { normal: 'Inter' },
    900: { normal: 'Inter' },
  },
});

/**
 * 等宽/数字字体 - 用于积分数字、百分比等
 * 使用系统等宽字体，无需额外加载
 */
export const monoFont = createFont({
  family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    true: 14,
    5: 16,
    6: 18,
    7: 24,
    8: 32,
  },
  lineHeight: {
    1: 17,
    2: 19,
    3: 21,
    4: 23,
    true: 23,
    5: 25,
    6: 27,
    7: 32,
    8: 40,
  },
  weight: {
    4: '400',
    true: '400',
    6: '600',
    7: '700',
  },
  letterSpacing: {
    4: 0,
    true: 0,
  },
});
