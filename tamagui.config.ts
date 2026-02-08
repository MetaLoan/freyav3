import { createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v3';
import { headingFont, bodyFont, monoFont } from './src/config/fonts';
import { themes } from './src/config/theme';

/**
 * Freya V3 - Tamagui 全局配置
 * 
 * 设计风格：Mystical Luxury（神秘奢华）
 * - 暗色主基调 + 金色/蓝色/珊瑚橙强调
 * - Playfair Display 衬线标题 + Inter 无衬线正文
 * - 大圆角卡片 + 玻璃拟态
 */
const appConfig = createTamagui({
  ...config,
  fonts: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
  },
  themes: {
    ...config.themes,
    ...themes,
  },
  // 默认使用暗色主题
  defaultTheme: 'dark',
});

export type AppConfig = typeof appConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
