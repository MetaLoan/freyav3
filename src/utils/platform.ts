import { Platform } from 'react-native';
import type { WebApp } from '@twa-dev/types';

/**
 * 平台检测工具
 * 用于区分 iOS / Android / Web / Telegram Mini App 环境
 */

/** 是否为 Web 环境 */
export const isWeb = Platform.OS === 'web';

/** 是否为 iOS */
export const isIOS = Platform.OS === 'ios';

/** 是否为 Android */
export const isAndroid = Platform.OS === 'android';

/** 是否为原生客户端 (iOS 或 Android) */
export const isNative = isIOS || isAndroid;

/**
 * 是否在 Telegram Mini App 环境中运行
 * 通过检测 window.Telegram.WebApp.initData 来判断
 */
export const isTelegram =
  isWeb &&
  typeof window !== 'undefined' &&
  !!(window as any).Telegram?.WebApp?.initData;

/**
 * 获取 Telegram WebApp 实例（带完整 TypeScript 类型）
 * 仅在 TMA 环境下有效，其他环境返回 null
 */
export const getTelegramWebApp = (): WebApp | null => {
  if (!isTelegram) return null;
  return ((window as any).Telegram?.WebApp as WebApp) ?? null;
};

/** 平台类型 */
export type PlatformType = 'ios' | 'android' | 'tma' | 'web';

/** 获取当前平台类型标识 */
export const getPlatformType = (): PlatformType => {
  if (isTelegram) return 'tma';
  if (isWeb) return 'web';
  return Platform.OS as 'ios' | 'android';
};
