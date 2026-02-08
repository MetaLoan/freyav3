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
 * 强制请求 Telegram 全屏模式
 * 同时向所有通道发送事件（不早退），与 laura-ai-clone 保持一致
 */
const forceRequestFullscreen = (): void => {
  try {
    // 方法 A: TelegramWebviewProxy（移动端/桌面端）
    // @ts-ignore
    if (window.TelegramWebviewProxy?.postEvent) {
      // @ts-ignore
      window.TelegramWebviewProxy.postEvent('web_app_request_fullscreen', '');
    }
    // 方法 B: postMessage（Web iframe）
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        JSON.stringify({ eventType: 'web_app_request_fullscreen' }),
        '*'
      );
    }
    // 方法 C: external.notify（Windows Phone）
    // @ts-ignore
    if (window.external?.notify) {
      // @ts-ignore
      window.external.notify(
        JSON.stringify({ eventType: 'web_app_request_fullscreen' })
      );
    }
  } catch (e) {
    console.error('[FORCE] Error sending web_app_request_fullscreen:', e);
  }
};

/**
 * 强制禁用垂直滑动（防止下拉关闭干扰全屏）
 */
const forceDisableVerticalSwipes = (): void => {
  try {
    // @ts-ignore
    if (window.TelegramWebviewProxy?.postEvent) {
      // @ts-ignore
      window.TelegramWebviewProxy.postEvent(
        'web_app_setup_swipe_behavior',
        JSON.stringify({ allow_vertical_swipe: false })
      );
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        JSON.stringify({
          eventType: 'web_app_setup_swipe_behavior',
          eventData: { allow_vertical_swipe: false },
        }),
        '*'
      );
    }
  } catch (e) {
    console.error('[FORCE] Error sending web_app_setup_swipe_behavior:', e);
  }
};

/**
 * 初始化 Telegram Mini App
 *
 * 双层策略：
 * 1. web/index.html 中已有早期初始化脚本（SDK 加载后立即执行）
 * 2. 这里是 React 层的补充初始化，增加：
 *    - 用户交互触发全屏（某些平台需要手势）
 *    - 1 秒间隔轮询重试（前 5 次）
 *    - 事件监听（安全区域、全屏状态变化）
 *    - 禁用垂直滑动
 */
export const initTelegramApp = (): void => {
  if (!isTelegram) return;

  const webApp = getTelegramWebApp();
  if (!webApp) return;

  // === 调试信息 ===
  console.log('=== Telegram WebApp Debug Info ===');
  console.log('version:', webApp.version);
  console.log('platform:', webApp.platform);
  console.log('isExpanded:', webApp.isExpanded);
  console.log('isFullscreen:', webApp.isFullscreen);
  console.log('requestFullscreen available:', typeof webApp.requestFullscreen);
  // @ts-ignore
  console.log('TelegramWebviewProxy available:', !!(window as any).TelegramWebviewProxy);
  console.log('================================');

  // 通知 Telegram 应用已就绪（幂等调用）
  webApp.ready();

  // 先 expand 到最大高度
  try { webApp.expand(); } catch (e) {}

  // 确保头部颜色与背景一致
  if (webApp.setHeaderColor) webApp.setHeaderColor('#131110');
  if (webApp.setBackgroundColor) webApp.setBackgroundColor('#131110');

  // === 全屏请求 ===
  // 1. 强制全屏（所有通道同时发送）
  forceRequestFullscreen();

  // 2. 同时尝试 SDK 方法
  if (typeof webApp.requestFullscreen === 'function') {
    try { webApp.requestFullscreen(); } catch (e) {}
  }

  // 3. 禁用垂直滑动
  if (typeof (webApp as any).disableVerticalSwipes === 'function') {
    try { (webApp as any).disableVerticalSwipes(); } catch (e) {}
  }
  forceDisableVerticalSwipes();

  // === 用户交互触发全屏（某些 Telegram 客户端要求用户手势） ===
  const handleFirstInteraction = () => {
    console.log('📱 User interaction detected, attempting fullscreen...');
    forceRequestFullscreen();
    if (typeof webApp.requestFullscreen === 'function') {
      try { webApp.requestFullscreen(); } catch (e) {}
    }
    try { webApp.expand(); } catch (e) {}
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  }

  // === 1 秒间隔轮询重试（前 5 次） ===
  let checkCount = 0;
  const expandInterval = setInterval(() => {
    checkCount++;

    // 前 5 次强制请求全屏 + 禁用垂直滑动
    if (checkCount <= 5) {
      forceRequestFullscreen();
      forceDisableVerticalSwipes();

      if (webApp.isFullscreen === false && typeof webApp.requestFullscreen === 'function') {
        try { webApp.requestFullscreen(); } catch (e) {}
      }
      if (!webApp.isExpanded) {
        try { webApp.expand(); } catch (e) {}
      }
    }

    // 前 10 次更新安全区域 CSS 变量
    if (checkCount <= 10) {
      syncSafeAreaToCSSVariables();
    }

    // 10 次后停止轮询
    if (checkCount >= 10) {
      clearInterval(expandInterval);
    }
  }, 1000);

  // 同步安全区域到 CSS 变量
  syncSafeAreaToCSSVariables();

  // === 事件监听 ===
  if (typeof webApp.onEvent === 'function') {
    webApp.onEvent('viewportChanged', () => syncSafeAreaToCSSVariables());
    webApp.onEvent('safeAreaChanged' as any, () => syncSafeAreaToCSSVariables());
    webApp.onEvent('contentSafeAreaChanged' as any, () => syncSafeAreaToCSSVariables());

    webApp.onEvent('fullscreenChanged' as any, () => {
      console.log('📱 Telegram fullscreen changed:', webApp.isFullscreen);
      syncSafeAreaToCSSVariables();
    });

    webApp.onEvent('fullscreenFailed' as any, (evt: any) => {
      const error = evt?.error || evt;
      console.warn('⚠️ Telegram fullscreenFailed:', error);
      if (error !== 'ALREADY_FULLSCREEN' && error !== 'ALREADY_REQUESTED') {
        setTimeout(() => forceRequestFullscreen(), 1000);
      }
    });
  }

  // 设置页面背景色
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
