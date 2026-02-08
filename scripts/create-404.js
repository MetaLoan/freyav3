#!/usr/bin/env node

/**
 * 创建 404.html 用于 GitHub Pages SPA 路由
 * 使用重定向脚本将所有路由指向 index.html
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

// SPA 404 重定向脚本
const spa404Html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Freya V3</title>
  <script type="text/javascript">
    // GitHub Pages SPA 重定向
    // 将 404 页面重定向到 index.html，同时保留路径信息
    var pathSegmentsToKeep = 1; // freyav3 是第一段路径
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body>
  正在加载...
</body>
</html>`;

if (fs.existsSync(distDir)) {
  fs.writeFileSync(notFoundPath, spa404Html, 'utf8');
  console.log('Created 404.html for GitHub Pages SPA routing');
  
  // 同时修改 index.html 添加重定向处理脚本
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // 添加 SPA 重定向处理脚本
    const spaRedirectScript = `
    <script type="text/javascript">
      // GitHub Pages SPA 重定向处理
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>`;
    
    if (!indexContent.includes('GitHub Pages SPA 重定向处理')) {
      indexContent = indexContent.replace('<head>', '<head>' + spaRedirectScript);
      fs.writeFileSync(indexPath, indexContent, 'utf8');
      console.log('Added SPA redirect handler to index.html');
    }
  }
} else {
  console.error('dist/ directory not found!');
  process.exit(1);
}
