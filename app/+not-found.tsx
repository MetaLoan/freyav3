import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { YStack, Text } from 'tamagui';
import { palette } from '../src/config/theme';

/**
 * 404 页面
 *
 * 处理未匹配的路由，关键场景：
 * - GitHub Pages 子目录部署 (/freyav3)
 * - expo-router baseUrl 未生效时的兜底
 * - Telegram 内嵌浏览器的路径问题
 *
 * Web 端使用 window.location.replace 而非 router.replace，
 * 确保浏览器 URL 保留正确的 base path（/freyav3/）
 */

const BASE_PATH = '/freyav3';

export default function NotFoundScreen() {
  const pathname = usePathname();
  const [canNavigate, setCanNavigate] = useState(false);

  // 延迟 500ms 确保 Root Layout 完全挂载
  useEffect(() => {
    const timer = setTimeout(() => setCanNavigate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canNavigate) return;

    // Web 端：使用 window.location.replace 保证 base path 正确
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // 防止无限重定向循环：5 秒内不重复跳转
      const guardKey = '__freya_404_ts';
      const now = Date.now();
      const lastRedirect = sessionStorage.getItem(guardKey);

      if (lastRedirect && (now - parseInt(lastRedirect, 10)) < 5000) {
        // 5 秒内已经重定向过，不再跳转，避免死循环
        console.warn('[404] Redirect loop detected, stopping.');
        return;
      }

      sessionStorage.setItem(guardKey, now.toString());

      // 计算目标 URL
      const currentPath = window.location.pathname;
      let targetPath = BASE_PATH + '/';

      // 如果当前路径在 base path 下有子路径（且不是 base 本身），
      // 说明是真正的 404，重定向到首页
      if (currentPath.startsWith(BASE_PATH + '/')) {
        const subPath = currentPath.slice(BASE_PATH.length);
        // 子路径只是 / 的话就是首页
        if (subPath && subPath !== '/') {
          // 真正的子路由 404，重定向到首页
          targetPath = BASE_PATH + '/';
        }
      }

      // 使用 window.location.replace 确保浏览器 URL 正确
      // 这会触发整页刷新，但能保证 URL 包含 /freyav3/
      window.location.replace(targetPath);
      return;
    }

    // 原生端：使用 expo-router 导航
    router.replace('/');
  }, [canNavigate, pathname]);

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
