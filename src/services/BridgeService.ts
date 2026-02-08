import { Alert } from 'react-native';
import { isTelegram, getTelegramWebApp, isNative, isWeb } from '../utils/platform';

/**
 * 跨平台 API 桥接服务
 * 
 * 统一封装不同平台的原生能力，提供一致的调用接口：
 * - iOS / Android：调用 React Native 原生 API
 * - Telegram Mini App：调用 Telegram WebApp API
 * - Web 浏览器：调用浏览器原生 API
 */
export const BridgeService = {
  /**
   * 显示弹窗
   * TMA: 使用 Telegram.WebApp.showAlert()
   * Web: 使用 window.alert()
   * Native: 使用 React Native Alert.alert()
   */
  showAlert: (title: string, message: string): void => {
    if (isTelegram) {
      const webApp = getTelegramWebApp();
      webApp?.showAlert(message);
    } else if (isWeb) {
      // Web 端 RN 的 Alert.alert() 不可用，使用浏览器原生弹窗
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  },

  /**
   * 显示确认框
   * TMA: 使用 Telegram.WebApp.showConfirm()
   * Web: 使用 window.confirm()
   * Native: 使用 React Native Alert 带按钮
   */
  showConfirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isTelegram) {
        const webApp = getTelegramWebApp();
        webApp?.showConfirm(message, (confirmed: boolean) => {
          resolve(confirmed);
        });
      } else if (isWeb) {
        // Web 端使用浏览器原生确认框
        const result = window.confirm(message);
        resolve(result);
      } else {
        Alert.alert('确认', message, [
          { text: '取消', onPress: () => resolve(false), style: 'cancel' },
          { text: '确定', onPress: () => resolve(true) },
        ]);
      }
    });
  },

  /**
   * 触觉反馈
   * TMA: 使用 Telegram.WebApp.HapticFeedback
   * Web: 使用 navigator.vibrate()（如支持）
   * Native: 使用 expo-haptics
   */
  hapticImpact: async (
    style: 'light' | 'medium' | 'heavy' = 'medium'
  ): Promise<void> => {
    if (isTelegram) {
      const webApp = getTelegramWebApp();
      webApp?.HapticFeedback?.impactOccurred(style);
    } else if (isNative) {
      try {
        const Haptics = await import('expo-haptics');
        const styleMap = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        };
        await Haptics.impactAsync(styleMap[style]);
      } catch (e) {
        // expo-haptics 不可用时静默处理
      }
    } else if (isWeb && typeof navigator !== 'undefined' && navigator.vibrate) {
      // Web 端尝试使用 Vibration API（主要安卓 Chrome 支持）
      const durationMap = { light: 10, medium: 20, heavy: 40 };
      navigator.vibrate(durationMap[style]);
    }
  },

  /**
   * 通知反馈
   * TMA: 使用 Telegram.WebApp.HapticFeedback.notificationOccurred
   * Native: 使用 expo-haptics
   */
  hapticNotification: async (
    type: 'success' | 'warning' | 'error' = 'success'
  ): Promise<void> => {
    if (isTelegram) {
      const webApp = getTelegramWebApp();
      webApp?.HapticFeedback?.notificationOccurred(type);
    } else if (isNative) {
      try {
        const Haptics = await import('expo-haptics');
        const typeMap = {
          success: Haptics.NotificationFeedbackType.Success,
          warning: Haptics.NotificationFeedbackType.Warning,
          error: Haptics.NotificationFeedbackType.Error,
        };
        await Haptics.notificationAsync(typeMap[type]);
      } catch (e) {
        // 静默处理
      }
    }
  },

  /**
   * 关闭应用
   * TMA: 调用 Telegram.WebApp.close()
   * Web: 调用 window.close()
   * Native: 不执行任何操作（原生 App 不应被程序关闭）
   */
  closeApp: (): void => {
    if (isTelegram) {
      const webApp = getTelegramWebApp();
      webApp?.close();
    } else if (isWeb) {
      window.close();
    }
  },

  /**
   * 获取用户信息
   * TMA: 从 Telegram initDataUnsafe.user 获取
   * Native / Web: 返回 null（需要自行实现认证流程）
   */
  getUser: () => {
    if (isTelegram) {
      const webApp = getTelegramWebApp();
      return webApp?.initDataUnsafe?.user ?? null;
    }
    return null;
  },

  /**
   * 打开外部链接
   * TMA: 使用 Telegram.WebApp.openLink()
   * Web: 使用 window.open()
   * Native: 使用 expo-linking
   */
  openLink: async (url: string): Promise<void> => {
    if (isTelegram) {
      const webApp = getTelegramWebApp();
      webApp?.openLink(url);
    } else if (isWeb) {
      window.open(url, '_blank');
    } else {
      try {
        const Linking = await import('expo-linking');
        await Linking.openURL(url);
      } catch (e) {
        console.error('Failed to open link:', e);
      }
    }
  },
};
