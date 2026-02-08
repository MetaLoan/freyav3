#!/usr/bin/env node

/**
 * 修复 GitHub Pages 子路径的资源路径问题
 * 将所有绝对路径改为包含 /freyav3 前缀的路径
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

// 修复 index.html 中的路由初始化
function fixIndexHtml() {
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
    
    // 如果路径是 /freyav3 或 /freyav3/，设置正确的初始路由
    if (currentPath === basePath || currentPath === basePath + '/') {
      // 让 Expo Router 处理根路由
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
  fixIndexHtml();
  console.log('Done!');
} else {
  console.error('dist/ directory not found!');
  process.exit(1);
}
