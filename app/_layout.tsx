import React, { useCallback, useEffect, useState } from 'react';
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

// 在字体加载完成前保持 Splash Screen 可见
SplashScreen.preventAutoHideAsync();

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
    async function loadFonts() {
      try {
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
      } catch (e) {
        console.warn('Font loading failed:', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
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
