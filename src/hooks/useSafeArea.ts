import { useEffect, useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isTelegram } from '../utils/platform';
import { getTelegramSafeAreaInsets, type TelegramSafeAreaInsets } from '../utils/telegram';

/**
 * 统一安全区域 Insets 接口
 */
export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * useSafeArea - 跨平台统一安全区域 Hook
 * 
 * 自动根据运行环境返回正确的安全区域值：
 * - iOS / Android：使用系统 SafeAreaInsets
 * - Telegram Mini App：使用 SDK 计算值（safeAreaInset + contentSafeAreaInset）
 * 
 * 返回值可直接用于 Tamagui 组件的 padding 属性：
 * 
 * @example
 * ```tsx
 * const { top, bottom } = useSafeArea();
 * <YStack paddingTop={top} paddingBottom={bottom}>
 *   <Text>内容安全区域内</Text>
 * </YStack>
 * ```
 */
export const useSafeArea = (): SafeAreaInsets => {
  const nativeInsets = useSafeAreaInsets();
  const [tmaInsets, setTmaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    if (!isTelegram) return;

    const updateInsets = () => {
      setTmaInsets(getTelegramSafeAreaInsets());
    };

    // 首次获取
    updateInsets();

    // 监听 Telegram 事件动态更新
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
  }, []);

  return isTelegram ? tmaInsets : nativeInsets;
};

/**
 * useSafeAreaStyle - 返回可直接展开到 Tamagui 组件的样式对象
 * 
 * @param edges - 要应用的边，默认 ['top', 'bottom']
 * 
 * @example
 * ```tsx
 * const safeAreaStyle = useSafeAreaStyle(['top', 'bottom']);
 * <YStack {...safeAreaStyle}>
 *   <Text>自动处理安全区域</Text>
 * </YStack>
 * ```
 */
export const useSafeAreaStyle = (
  edges: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom']
) => {
  const insets = useSafeArea();

  return useMemo(
    () => ({
      paddingTop: edges.includes('top') ? insets.top : 0,
      paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: edges.includes('left') ? insets.left : 0,
      paddingRight: edges.includes('right') ? insets.right : 0,
    }),
    [insets.top, insets.bottom, insets.left, insets.right, edges]
  );
};

/**
 * useHeaderSafeArea - 专门用于固定定位头部的安全区域
 * 
 * 返回头部需要的顶部偏移量，常用于：
 * - 自定义导航栏
 * - 固定定位的搜索栏
 * - Telegram 内的浮动 Header
 * 
 * @example
 * ```tsx
 * const headerTop = useHeaderSafeArea();
 * <YStack position="absolute" top={0} left={0} right={0} paddingTop={headerTop}>
 *   <Text>自定义导航栏</Text>
 * </YStack>
 * ```
 */
export const useHeaderSafeArea = (): number => {
  const { top } = useSafeArea();
  return top;
};

/**
 * useBottomSafeArea - 专门用于底部 Tab Bar / 操作栏的安全区域
 * 
 * @example
 * ```tsx
 * const bottomPadding = useBottomSafeArea();
 * <YStack position="absolute" bottom={0} left={0} right={0} paddingBottom={bottomPadding}>
 *   <Button>底部操作按钮</Button>
 * </YStack>
 * ```
 */
export const useBottomSafeArea = (): number => {
  const { bottom } = useSafeArea();
  return bottom;
};
