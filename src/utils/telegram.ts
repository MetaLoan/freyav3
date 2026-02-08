import { isTelegram, getTelegramWebApp } from './platform';

/**
 * Telegram Mini App 工具函数
 * 
 * 安全区域计算严格遵循 Telegram SDK 8.0+ 规范：
 * 总安全区域高度 = safeAreaInset.top + contentSafeAreaInset.top
 * 
 * 详细文档参见: doc/TELEGRAM-SAFE-AREA.md
 */

/** Telegram 安全区域 Insets */
export interface TelegramSafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * 获取 Telegram 安全区域顶部高度
 * 叠加 safeAreaInset.top + contentSafeAreaInset.top
 * 
 * @returns 总安全区域高度（px），非 TMA 环境返回 0
 */
export const getSafeAreaTop = (): number => {
  if (!isTelegram) return 0;

  const webApp = getTelegramWebApp();
  if (!webApp) return 0;

  const systemTop = webApp.safeAreaInset?.top ?? 0;
  const contentTop = webApp.contentSafeAreaInset?.top ?? 0;
  const platform = webApp.platform || 'unknown';
  const isFullscreen = !!webApp.isFullscreen;

  const totalTop = systemTop + contentTop;

  console.log(
    `📱 [${platform}] SDK Insets (FS:${isFullscreen}): system=${systemTop}px, content=${contentTop}px, total=${totalTop}px`
  );

  return totalTop;
};

/**
 * 获取 Telegram 安全区域底部高度
 * 
 * @returns 底部安全区域高度（px），非 TMA 环境返回 0
 */
export const getSafeAreaBottom = (): number => {
  if (!isTelegram) return 0;

  const webApp = getTelegramWebApp();
  if (!webApp) return 0;

  return webApp.safeAreaInset?.bottom ?? 0;
};

/**
 * 获取完整的 Telegram 安全区域 Insets
 */
export const getTelegramSafeAreaInsets = (): TelegramSafeAreaInsets => {
  return {
    top: getSafeAreaTop(),
    bottom: getSafeAreaBottom(),
    left: 0,
    right: 0,
  };
};

/**
 * 将 Telegram 安全区域同步到 CSS 变量
 * 在 Web 端（TMA）环境下调用，确保 CSS 能读取到正确的安全区域值
 */
export const syncSafeAreaToCSSVariables = (): void => {
  if (!isTelegram || typeof document === 'undefined') return;

  const webApp = getTelegramWebApp();
  if (!webApp) return;

  const systemTop = webApp.safeAreaInset?.top ?? 0;
  const contentTop = webApp.contentSafeAreaInset?.top ?? 0;
  const totalTop = systemTop + contentTop;
  const bottom = webApp.safeAreaInset?.bottom ?? 0;

  const root = document.documentElement;
  root.style.setProperty('--telegram-safe-area-top', `${totalTop}px`);
  root.style.setProperty('--telegram-safe-area-bottom', `${bottom}px`);
  root.style.setProperty('--tg-safe-area-inset-top', `${systemTop}px`);
  root.style.setProperty('--tg-content-safe-area-inset-top', `${contentTop}px`);
};

/**
 * 初始化 Telegram Mini App
 * 调用 ready()、expand() 并同步主题
 */
export const initTelegramApp = (): void => {
  if (!isTelegram) return;

  const webApp = getTelegramWebApp();
  if (!webApp) return;

  // 通知 Telegram 应用已就绪
  webApp.ready();

  // 强制全屏模式（绕过 SDK 检查）
  // 参考：https://core.telegram.org/bots/webapps#web-app-request-fullscreen
  const forceRequestFullscreen = () => {
    try {
      // 方法1: 通过 TelegramWebviewProxy（移动端/桌面端）
      // @ts-ignore
      if (window.TelegramWebviewProxy?.postEvent) {
        // @ts-ignore
        window.TelegramWebviewProxy.postEvent('web_app_request_fullscreen', '');
        console.log('✅ Sent web_app_request_fullscreen via TelegramWebviewProxy');
        return true;
      }
      
      // 方法2: 通过 postMessage（Web iframe）
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          JSON.stringify({ eventType: 'web_app_request_fullscreen', eventData: '' }), 
          '*'
        );
        console.log('✅ Sent web_app_request_fullscreen via postMessage');
        return true;
      }
    } catch (err) {
      console.error('⚠️ Error sending web_app_request_fullscreen:', err);
    }
    return false;
  };

  // 1. 优先尝试强制全屏
  const forced = forceRequestFullscreen();

  // 2. 无论强制是否成功，都尝试调用 SDK 方法作为保底
  // 因为有些新版客户端可能只认 SDK 方法，或者 SDK 方法内部有兼容逻辑
  if (typeof webApp.requestFullscreen === 'function') {
    try {
      webApp.requestFullscreen();
      console.log('✅ Telegram fullscreen mode requested (SDK)');
    } catch (e) {
      console.warn('⚠️ Telegram requestFullscreen failed:', e);
    }
  } else if (!forced) {
    // 只有在强制失败且 SDK 方法也不存在时才打印“不可用”
    console.log('ℹ️ Telegram requestFullscreen API not available (SDK < 8.0)');
  }

  // 3. 始终调用 expand() 作为最后的防线
  try {
    webApp.expand();
    console.log('✅ Telegram expanded');
  } catch (e) {
    console.warn('⚠️ Telegram expand failed:', e);
  }

  // 确保头部颜色与背景一致
  if (webApp.setHeaderColor) {
    webApp.setHeaderColor('#131110'); // bgDeep
  }
  if (webApp.setBackgroundColor) {
    webApp.setBackgroundColor('#131110'); // bgDeep
  }

  // 同步安全区域到 CSS 变量
  syncSafeAreaToCSSVariables();

  // 监听视口变化，动态更新安全区域
  if (typeof webApp.onEvent === 'function') {
    webApp.onEvent('viewportChanged', () => {
      syncSafeAreaToCSSVariables();
    });
    webApp.onEvent('safeAreaChanged' as any, () => {
      syncSafeAreaToCSSVariables();
    });
    webApp.onEvent('contentSafeAreaChanged' as any, () => {
      syncSafeAreaToCSSVariables();
    });
    // 监听全屏状态变化
    webApp.onEvent('fullscreenChanged' as any, () => {
      console.log('📱 Telegram fullscreen changed:', webApp.isFullscreen);
      syncSafeAreaToCSSVariables();
    });
  }

  // 设置页面背景色与 Telegram 主题一致
  if (typeof document !== 'undefined' && webApp.backgroundColor) {
    document.body.style.backgroundColor = webApp.backgroundColor;
  }

  console.log('✅ Telegram Mini App initialized');
};

/**
 * 获取 Telegram 用户信息（带类型）
 */
export const getTelegramUser = () => {
  if (!isTelegram) return null;
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user ?? null;
};

/**
 * 获取 Telegram 主题参数（带类型）
 */
export const getTelegramThemeParams = () => {
  if (!isTelegram) return null;
  const webApp = getTelegramWebApp();
  return webApp?.themeParams ?? null;
};

/**
 * 获取 Telegram 颜色方案 ('light' | 'dark')
 */
export const getTelegramColorScheme = (): 'light' | 'dark' => {
  if (!isTelegram) return 'light';
  const webApp = getTelegramWebApp();
  return webApp?.colorScheme || 'light';
};
