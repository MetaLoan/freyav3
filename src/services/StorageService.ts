import { Platform } from 'react-native';
import { isTelegram, getTelegramWebApp, isNative, isWeb } from '../utils/platform';

/**
 * 跨平台存储服务
 * 
 * 统一封装不同平台的持久化存储：
 * - Telegram Mini App: Telegram CloudStorage API
 * - iOS / Android: expo-secure-store（加密本地存储）
 * - Web（非 TMA）: localStorage
 * 
 * 所有方法均为异步，API 保持一致：
 * - get(key) → string | null
 * - set(key, value) → void
 * - remove(key) → void
 * - clear() → void
 */

// ============================================================
// Telegram CloudStorage 适配器
// ============================================================

const telegramStorage = {
  get: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const webApp = getTelegramWebApp();
      if (!webApp?.CloudStorage) {
        resolve(null);
        return;
      }
      webApp.CloudStorage.getItem(key, (error: string | null, value?: string) => {
        if (error) {
          console.warn('[StorageService] TMA get error:', error);
          resolve(null);
        } else {
          resolve(value || null);
        }
      });
    });
  },

  set: (key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const webApp = getTelegramWebApp();
      if (!webApp?.CloudStorage) {
        reject(new Error('CloudStorage not available'));
        return;
      }
      webApp.CloudStorage.setItem(key, value, (error: any) => {
        if (error) {
          console.warn('[StorageService] TMA set error:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },

  remove: (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const webApp = getTelegramWebApp();
      if (!webApp?.CloudStorage) {
        reject(new Error('CloudStorage not available'));
        return;
      }
      webApp.CloudStorage.removeItem(key, (error: any) => {
        if (error) {
          console.warn('[StorageService] TMA remove error:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },

  clear: async (): Promise<void> => {
    const webApp = getTelegramWebApp();
    if (!webApp?.CloudStorage) return;

    return new Promise((resolve) => {
      webApp.CloudStorage.getKeys((error: string | null, keys?: string[]) => {
        if (error || !keys?.length) {
          resolve();
          return;
        }
        webApp.CloudStorage.removeItems(keys, () => resolve());
      });
    });
  },
};

// ============================================================
// Native (expo-secure-store) 适配器
// ============================================================

const nativeStorage = {
  get: async (key: string): Promise<string | null> => {
    try {
      const SecureStore = await import('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('[StorageService] Native get error:', e);
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('[StorageService] Native set error:', e);
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('[StorageService] Native remove error:', e);
    }
  },

  clear: async (): Promise<void> => {
    // expo-secure-store 没有 clear 方法
    // 需要逐个删除已知的 key
    console.warn('[StorageService] Native clear: not fully supported, use remove() for specific keys');
  },
};

// ============================================================
// Web (localStorage) 适配器
// ============================================================

const webStorage = {
  get: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[StorageService] Web get error:', e);
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[StorageService] Web set error:', e);
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[StorageService] Web remove error:', e);
    }
  },

  clear: async (): Promise<void> => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[StorageService] Web clear error:', e);
    }
  },
};

// ============================================================
// 统一导出
// ============================================================

function getAdapter() {
  if (isTelegram) return telegramStorage;
  if (isNative) return nativeStorage;
  return webStorage;
}

export const StorageService = {
  /**
   * 获取存储的值
   * @returns 存储的字符串值，不存在则返回 null
   */
  get: (key: string): Promise<string | null> => {
    return getAdapter().get(key);
  },

  /**
   * 存储值
   * @param key 键名
   * @param value 字符串值
   */
  set: (key: string, value: string): Promise<void> => {
    return getAdapter().set(key, value);
  },

  /**
   * 删除指定键
   */
  remove: (key: string): Promise<void> => {
    return getAdapter().remove(key);
  },

  /**
   * 清空所有存储
   */
  clear: (): Promise<void> => {
    return getAdapter().clear();
  },

  /**
   * 获取 JSON 对象
   * 自动 JSON.parse，解析失败返回 null
   */
  getJSON: async <T = unknown>(key: string): Promise<T | null> => {
    const value = await getAdapter().get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * 存储 JSON 对象
   * 自动 JSON.stringify
   */
  setJSON: async (key: string, value: unknown): Promise<void> => {
    return getAdapter().set(key, JSON.stringify(value));
  },
};

// ============================================================
// 存储 Key 常量（统一管理所有 key，避免拼写错误）
// ============================================================

export const STORAGE_KEYS = {
  /** JWT Token */
  AUTH_TOKEN: 'freya_auth_token',
  /** 用户信息缓存 */
  USER_PROFILE: 'freya_user_profile',
  /** 引导完成标记 */
  ONBOARDING_COMPLETED: 'freya_onboarding_completed',
  /** 主题偏好 */
  THEME_MODE: 'freya_theme_mode',
  /** 字体偏好 */
  FONT_PREFERENCE: 'freya_font_preference',
  /** 声音开关 */
  SOUND_ENABLED: 'freya_sound_enabled',
  /** 触觉开关 */
  HAPTICS_ENABLED: 'freya_haptics_enabled',
  /** 对话草稿 */
  CHAT_DRAFT: 'freya_chat_draft',
} as const;
