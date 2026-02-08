import React, { useEffect, useMemo } from 'react';
import { TamaguiProvider as TamaguiProviderBase, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { isTelegram } from '../utils/platform';
import { getTelegramColorScheme, initTelegramApp } from '../utils/telegram';

interface Props {
  children: React.ReactNode;
}

/**
 * 全局 Tamagui 主题提供者
 * 
 * - 默认使用暗色主题（Mystical Luxury 风格）
 * - TMA 环境下跟随 Telegram 主题设置
 * - 初始化 Telegram SDK
 */
export const AppTamaguiProvider: React.FC<Props> = ({ children }) => {
  const colorScheme = useMemo(() => {
    if (isTelegram) {
      return getTelegramColorScheme();
    }
    // 默认使用暗色主题（符合参考图设计方向）
    return 'dark';
  }, []);

  useEffect(() => {
    if (isTelegram) {
      initTelegramApp();
    }
  }, []);

  return (
    <TamaguiProviderBase config={config} defaultTheme={colorScheme}>
      <Theme name={colorScheme}>
        {children}
      </Theme>
    </TamaguiProviderBase>
  );
};
