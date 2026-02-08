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
 * 请求 Telegram 全屏模式
 * 尝试三种方式，按优先级：SDK → TelegramWebviewProxy → postMessage
 */
const requestTelegramFullscreen = (webApp: any): boolean => {
  let success = false;

  // 如果已经全屏，跳过
  if (webApp.isFullscreen) {
    return true;
  }

  // 方法 A: SDK requestFullscreen（最标准的方式）
  if (typeof webApp.requestFullscreen === 'function') {
    try {
      webApp.requestFullscreen();
      console.log('✅ requestFullscreen via SDK');
      success = true;
    } catch (e: any) {
      // ALREADY_REQUESTED 不算失败
      if (e?.message?.includes?.('ALREADY_REQUESTED') || e?.message?.includes?.('ALREADY_FULLSCREEN')) {
        return true;
      }
      console.warn('⚠️ SDK requestFullscreen failed:', e?.message || e);
    }
  }

  // 方法 B: TelegramWebviewProxy（移动端/桌面端直接通信）
  try {
    // @ts-ignore
    if (window.TelegramWebviewProxy?.postEvent) {
      // @ts-ignore
      window.TelegramWebviewProxy.postEvent('web_app_request_fullscreen', '');
      console.log('✅ requestFullscreen via TelegramWebviewProxy');
      success = true;
    }
  } catch (e) {
    console.warn('⚠️ TelegramWebviewProxy fullscreen failed:', e);
  }

  // 方法 C: iframe postMessage（Web 版 Telegram）
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        JSON.stringify({ eventType: 'web_app_request_fullscreen', eventData: '' }),
        '*'
      );
      console.log('✅ requestFullscreen via postMessage');
      success = true;
    }
  } catch (e) {
    console.warn('⚠️ postMessage fullscreen failed:', e);
  }

  if (!success) {
    console.log('ℹ️ Telegram fullscreen API not available (client may not support Bot API 8.0+)');
  }

  return success;
};

/**
 * 初始化 Telegram Mini App
 *
 * 注意：web/index.html 中已有早期初始化脚本（SDK 加载后立即执行），
 * 这里是 React 层的补充初始化，主要负责：
 * - 事件监听（安全区域变化、全屏状态变化等）
 * - 全屏重试（React 就绪后再试一轮）
 * - CSS 变量同步
 */
export const initTelegramApp = (): void => {
  if (!isTelegram) return;

  const webApp = getTelegramWebApp();
  if (!webApp) return;

  // 通知 Telegram 应用已就绪（幂等调用，HTML 层已调用过一次）
  webApp.ready();

  // 先 expand 到最大高度
  try {
    webApp.expand();
  } catch (e) {
    console.warn('⚠️ Telegram expand failed:', e);
  }

  // 确保头部颜色与背景一致
  if (webApp.setHeaderColor) {
    webApp.setHeaderColor('#131110');
  }
  if (webApp.setBackgroundColor) {
    webApp.setBackgroundColor('#131110');
  }

  // 全屏请求：React 就绪后再试一轮（带指数退避重试）
  // HTML 层已经尝试过多次了，这里是补充保险
  const retryFullscreen = (retriesLeft: number, delay: number) => {
    if (retriesLeft <= 0 || webApp.isFullscreen) return;

    setTimeout(() => {
      if (webApp.isFullscreen) return;
      requestTelegramFullscreen(webApp);
      retryFullscreen(retriesLeft - 1, delay * 2);
    }, delay);
  };

  // 立即请求一次，然后延迟重试 3 次（500ms → 1s → 2s）
  requestTelegramFullscreen(webApp);
  retryFullscreen(3, 500);

  // 同步安全区域到 CSS 变量
  syncSafeAreaToCSSVariables();

  // 监听各种事件
  if (typeof webApp.onEvent === 'function') {
    // 视口 / 安全区域变化 → 更新 CSS 变量
    webApp.onEvent('viewportChanged', () => {
      syncSafeAreaToCSSVariables();
    });
    webApp.onEvent('safeAreaChanged' as any, () => {
      syncSafeAreaToCSSVariables();
    });
    webApp.onEvent('contentSafeAreaChanged' as any, () => {
      syncSafeAreaToCSSVariables();
    });

    // 全屏状态变化 → 更新安全区域
    webApp.onEvent('fullscreenChanged' as any, () => {
      console.log('📱 Telegram fullscreen changed:', webApp.isFullscreen);
      syncSafeAreaToCSSVariables();
    });

    // 全屏请求失败 → 记录原因，非重复请求时重试
    webApp.onEvent('fullscreenFailed' as any, (evt: any) => {
      const error = evt?.error || evt;
      console.warn('⚠️ Telegram fullscreenFailed:', error);
      if (error !== 'ALREADY_FULLSCREEN' && error !== 'ALREADY_REQUESTED') {
        setTimeout(() => requestTelegramFullscreen(webApp), 1000);
      }
    });
  }

  // 设置页面背景色与 Telegram 主题一致
  if (typeof document !== 'undefined' && webApp.backgroundColor) {
    document.body.style.backgroundColor = webApp.backgroundColor;
  }

  console.log('✅ Telegram Mini App initialized (platform:', webApp.platform, ', version:', webApp.version, ')');
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
