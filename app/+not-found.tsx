import { useEffect } from 'react';
import { router, usePathname, useGlobalSearchParams, useRootNavigationState } from 'expo-router';
import { YStack, Text } from 'tamagui';
import { palette } from '../src/config/theme';

/**
 * 404 页面
 * 
 * 处理未匹配的路由：
 * - 在 GitHub Pages 子目录部署时，可能会出现路径问题
 * - 尝试重定向到首页
 */
export default function NotFoundScreen() {
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavState?.key) return;

    // 兼容 /freyav3 这种 base path 被当成路由的场景（Telegram 内嵌）
    if (pathname && pathname.startsWith('/freyav3')) {
      const stripped = pathname.replace(/^\/freyav3/, '') || '/';
      router.replace(stripped);
      return;
    }
    router.replace('/');
  }, [pathname, rootNavState?.key, searchParams]);

  return (
    <YStack
      flex={1}
      backgroundColor={palette.bgDeep}
      alignItems="center"
      justifyContent="center"
      padding="$4"
    >
      <Text
        fontFamily="$heading"
        fontSize={32}
        fontWeight="700"
        color={palette.gold50}
        marginBottom="$4"
      >
        Page Not Found
      </Text>
      <Text
        fontFamily="$body"
        fontSize={16}
        color={palette.gold200}
        textAlign="center"
        marginBottom="$2"
      >
        The requested page could not be found.
      </Text>
      <Text
        fontFamily="$mono"
        fontSize={12}
        color={palette.textTertiary}
        textAlign="center"
      >
        Path: {pathname}
      </Text>
      <Text
        fontFamily="$body"
        fontSize={14}
        color={palette.gold300}
        marginTop="$4"
      >
        Redirecting to home...
      </Text>
    </YStack>
  );
}
