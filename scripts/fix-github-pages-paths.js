#!/usr/bin/env node

/**
 * 修复 GitHub Pages 子路径的资源路径问题
 * + 注入 Telegram SDK、全屏初始化脚本、Google Fonts
 *
 * 重要：Expo `output: "single"` 构建时不使用 web/index.html，
 * 而是生成默认模板。所以必须在这里注入所有需要的 <head> 内容。
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const BASE_PATH = '/freyav3';

function fixPathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 修复 HTML 中的绝对路径
  if (filePath.endsWith('.html')) {
    // 确保 base tag 存在且正确
    if (!content.includes('<base')) {
      content = content.replace(
        '<head>',
        `<head>\n    <base href="${BASE_PATH}/">`
      );
    } else {
      // 更新现有的 base tag
      content = content.replace(
        /<base[^>]*>/g,
        `<base href="${BASE_PATH}/">`
      );
    }
  }

  // 修复 JavaScript/CSS 中的绝对路径引用
  // 注意：只修复以 / 开头但不是 // 或已经是 /freyav3 的路径
  
  // 修复 /_expo/static 路径
  content = content.replace(/(['"=])\/_expo\/static/g, `$1${BASE_PATH}/_expo/static`);
  
  // 修复 /assets/ 路径（但不修复已有 freyav3 前缀的）
  content = content.replace(/(['"=])\/assets\//g, `$1${BASE_PATH}/assets/`);
  
  // 修复 JS 中的路径字符串（src、href 等属性）
  // 例如: src="/bundles/..." 改为 src="/freyav3/bundles/..."
  content = content.replace(/src=["']\/(?!freyav3|\/|http)/g, `src="${BASE_PATH}/`);
  content = content.replace(/href=["']\/(?!freyav3|\/|http)/g, `href="${BASE_PATH}/`);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
      if (fixPathsInFile(filePath)) {
        console.log(`Fixed paths in: ${filePath}`);
      }
    }
  });
}

/**
 * 注入 Telegram SDK、全屏初始化、Google Fonts、安全区 CSS 到 index.html
 *
 * 因为 Expo `output: "single"` 构建不使用 web/index.html，
 * 所以所有 <head> 内容必须在这里注入。
 */
function injectHeadContent() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let content = fs.readFileSync(indexPath, 'utf8');

  // ========== 注入 <head> 内容 ==========
  const headInjection = `
    <!-- === 以下由 fix-github-pages-paths.js 注入 === -->

    <!-- viewport 增强：viewport-fit=cover 用于 Telegram 安全区域 -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1.00001, viewport-fit=cover" />

    <!-- Google Fonts 预加载 -->
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" media="print" onload="this.media='all'" />

    <!-- Telegram Mini App SDK（不带 ?v= 参数，始终加载最新版） -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>

    <!-- 早期 Telegram 初始化（React 渲染前执行） -->
    <script>
    (function() {
      try {
        var tg = window.Telegram && window.Telegram.WebApp;
        if (!tg) return;

        tg.ready();
        if (tg.setHeaderColor) tg.setHeaderColor('#131110');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#131110');
        try { tg.expand(); } catch(e) {}

        var forceFS = function() {
          try {
            if (window.TelegramWebviewProxy && window.TelegramWebviewProxy.postEvent) {
              window.TelegramWebviewProxy.postEvent('web_app_request_fullscreen', '');
            }
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(JSON.stringify({eventType:'web_app_request_fullscreen'}), '*');
            }
            if (window.external && window.external.notify) {
              window.external.notify(JSON.stringify({eventType:'web_app_request_fullscreen'}));
            }
          } catch(e) {}
          if (typeof tg.requestFullscreen === 'function') {
            try { tg.requestFullscreen(); } catch(e) {}
          }
        };

        var forceDisableSwipe = function() {
          try {
            if (window.TelegramWebviewProxy && window.TelegramWebviewProxy.postEvent) {
              window.TelegramWebviewProxy.postEvent('web_app_setup_swipe_behavior', JSON.stringify({allow_vertical_swipe:false}));
            }
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(JSON.stringify({eventType:'web_app_setup_swipe_behavior',eventData:{allow_vertical_swipe:false}}), '*');
            }
          } catch(e) {}
          if (typeof tg.disableVerticalSwipes === 'function') {
            try { tg.disableVerticalSwipes(); } catch(e) {}
          }
        };

        forceFS();
        forceDisableSwipe();
        setTimeout(forceFS, 300);
        setTimeout(forceFS, 800);
        setTimeout(forceFS, 1500);

        if (typeof tg.onEvent === 'function') {
          tg.onEvent('fullscreenFailed', function(e) {
            console.warn('[TG] fullscreenFailed:', e && e.error || e);
            if (!e || (e.error !== 'ALREADY_FULLSCREEN' && e.error !== 'ALREADY_REQUESTED')) {
              setTimeout(forceFS, 500);
            }
          });
        }
      } catch(e) {
        console.error('[TG Early] init failed:', e);
      }
    })();
    </script>

    <!-- Telegram 安全区域 CSS 变量 -->
    <style>
      html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      :root {
        --telegram-safe-area-top: calc(var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px));
        --telegram-safe-area-bottom: var(--tg-safe-area-inset-bottom, 0px);
      }
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
    </style>

    <!-- === 注入结束 === -->`;

  // 注入到 </head> 前面（确保在所有原有内容之后）
  if (!content.includes('fix-github-pages-paths.js 注入')) {
    content = content.replace('</head>', headInjection + '\n  </head>');
    console.log('Injected Telegram SDK + Google Fonts + safe area CSS into index.html');
  }

  // 替换 Expo 默认的 viewport meta（不含 viewport-fit=cover）
  // 我们的注入版本已经包含了正确的 viewport
  content = content.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
    '<!-- viewport replaced by injected version -->'
  );

  fs.writeFileSync(indexPath, content, 'utf8');
}

// 修复 index.html 中的路由初始化
function fixIndexHtmlRouting() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // 添加路由修复脚本（在 body 开头）
  const routeFixScript = `
<script>
  // Expo Router base path fix for GitHub Pages
  (function() {
    var basePath = '/freyav3';
    var currentPath = window.location.pathname;
    
    if (currentPath === basePath || currentPath === basePath + '/') {
      console.log('[GitHub Pages] Root path detected, Expo Router will handle routing');
    }
    
    // 处理 GitHub Pages 404 重定向的查询参数
    if (window.location.search.startsWith('?/')) {
      var redirectPath = window.location.search.slice(2).split('&')[0];
      if (redirectPath) {
        window.history.replaceState(null, null, basePath + '/' + redirectPath);
      }
    }
  })();
</script>`;
  
  if (!content.includes('Expo Router base path fix')) {
    content = content.replace('<body>', '<body>' + routeFixScript);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Added route fix script to index.html');
  }
}

if (fs.existsSync(distDir)) {
  console.log('Fixing paths for GitHub Pages...');
  console.log('Base path:', BASE_PATH);
  walkDir(distDir);
  injectHeadContent();
  fixIndexHtmlRouting();
  console.log('Done!');
} else {
  console.error('dist/ directory not found!');
  process.exit(1);
}
