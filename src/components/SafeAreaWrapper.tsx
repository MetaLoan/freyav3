import React, { useEffect, useState } from 'react';
import { YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isTelegram, isNative } from '../utils/platform';
import { getTelegramSafeAreaInsets } from '../utils/telegram';

interface Props {
  children: React.ReactNode;
  /** 是否应用顶部安全区域 padding */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * 跨平台安全区域容器
 * 
 * - iOS / Android：使用 react-native-safe-area-context 的系统 insets
 * - Telegram Mini App：使用 Telegram SDK 计算的 insets
 *   (严格遵循 safeAreaInset.top + contentSafeAreaInset.top 叠加规则)
 */
export const SafeAreaWrapper: React.FC<Props> = ({
  children,
  edges = ['top', 'bottom'],
}) => {
  // 原生端的安全区域
  const nativeInsets = useSafeAreaInsets();

  // TMA 端的安全区域
  const [tmaInsets, setTmaInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    if (isTelegram) {
      const updateInsets = () => {
        setTmaInsets(getTelegramSafeAreaInsets());
      };

      updateInsets();

      // 监听 Telegram 视口变化
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp?.onEvent) {
        webApp.onEvent('viewportChanged', updateInsets);
        webApp.onEvent('safeAreaChanged', updateInsets);
        webApp.onEvent('contentSafeAreaChanged', updateInsets);

        return () => {
          webApp.offEvent('viewportChanged', updateInsets);
          webApp.offEvent('safeAreaChanged', updateInsets);
          webApp.offEvent('contentSafeAreaChanged', updateInsets);
        };
      }
    }
  }, []);

  // 根据平台选择 insets
  const insets = isTelegram ? tmaInsets : nativeInsets;

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={edges.includes('top') ? insets.top : 0}
      paddingBottom={edges.includes('bottom') ? insets.bottom : 0}
      paddingLeft={edges.includes('left') ? insets.left : 0}
      paddingRight={edges.includes('right') ? insets.right : 0}
    >
      {children}
    </YStack>
  );
};
