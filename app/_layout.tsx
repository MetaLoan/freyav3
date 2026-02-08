import React, { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import { AppTamaguiProvider } from '../src/providers/TamaguiProvider';
import { isTelegram } from '../src/utils/platform';

// 在字体加载完成前保持 Splash Screen 可见
SplashScreen.preventAutoHideAsync();

// 忽略部分 Web 端警告（来自第三方库）
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('props.pointerEvents is deprecated')) return;
    originalWarn(...args);
  };
}

/** Web 端字体最大等待时间（慢网络时避免 6s 超时卡住） */
const WEB_FONT_LOAD_TIMEOUT_MS = 4000;

/**
 * 根布局
 * 
 * 初始化顺序：
 * 1. 加载字体（Inter 正文 + Playfair Display 标题）
 * 2. SafeAreaProvider - 提供原生端安全区域上下文
 * 3. AppTamaguiProvider - 初始化 Tamagui（暗色主题） + Telegram SDK
 * 4. Stack - expo-router 路由堆栈
 */
export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5686af05-bc6a-46e0-a206-faf10bfcef99',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/_layout.tsx:useEffect',message:'App boot URL snapshot',data:{platform:Platform.OS,isTelegram,url:typeof window!=='undefined'?window.location.href:null,pathname:typeof window!=='undefined'?window.location.pathname:null,search:typeof window!=='undefined'?window.location.search:null,hash:typeof window!=='undefined'?window.location.hash:null},timestamp:Date.now(),runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    let cancelled = false;

    async function loadFonts() {
      try {
        // Web 端：使用 CSS 加载字体（index.html 中已引入 Google Fonts）
        // 不再调用 Font.loadAsync，避免慢网络下超时卡死
        if (Platform.OS === 'web') {
          setFontsLoaded(true);
          return;
        }

        await Font.loadAsync({
          // Inter - 正文字体（精简到常用字重）
          Inter_300Light,
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          // Playfair Display - 标题字体（衬线体）
          PlayfairDisplay_400Regular,
          PlayfairDisplay_500Medium,
          PlayfairDisplay_600SemiBold,
          PlayfairDisplay_700Bold,
          PlayfairDisplay_800ExtraBold,
          PlayfairDisplay_900Black,
        });

        if (!cancelled) setFontsLoaded(true);
      } catch (e) {
        console.warn('Font loading failed:', e);
        if (!cancelled) setFontsLoaded(true);
      }
    }

    loadFonts();
    return () => {
      cancelled = true;
    };
  }, []);

  // 移除 onLayout 依赖，直接在状态变化时隐藏启动屏
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppTamaguiProvider>
        {/* 暗色主题默认使用浅色状态栏文字 */}
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#131110' },
          }}
        />
      </AppTamaguiProvider>
    </SafeAreaProvider>
  );
}
