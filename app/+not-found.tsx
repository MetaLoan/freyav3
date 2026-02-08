import { useEffect } from 'react';
import { router, usePathname, useGlobalSearchParams } from 'expo-router';
import { YStack, Text } from 'tamagui';
import { palette } from '../src/config/theme';
import { isTelegram } from '../src/utils/platform';

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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5686af05-bc6a-46e0-a206-faf10bfcef99',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/+not-found.tsx:useEffect',message:'NotFound route hit',data:{pathname,searchParams,isTelegram,url:typeof window!=='undefined'?window.location.href:null,origin:typeof window!=='undefined'?window.location.origin:null},timestamp:Date.now(),runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    // 打印调试信息
    console.log('[NotFound] Current pathname:', pathname);
    console.log('[NotFound] Full URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
    
    // 延迟后重定向到首页
    const timer = setTimeout(() => {
      console.log('[NotFound] Redirecting to home...');
      router.replace('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname]);

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
