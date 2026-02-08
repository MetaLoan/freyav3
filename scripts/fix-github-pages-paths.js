#!/usr/bin/env node

/**
 * 修复 GitHub Pages 子路径的资源路径问题
 * 将所有绝对路径改为相对路径
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function fixPathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 修复 HTML 中的绝对路径
  if (filePath.endsWith('.html')) {
    // 确保 base tag 存在且正确
    if (!content.includes('<base')) {
      content = content.replace(
        '<head>',
        `<head>\n    <base href="/freyav3/">`
      );
    } else {
      // 更新现有的 base tag
      content = content.replace(
        /<base[^>]*>/g,
        '<base href="/freyav3/">'
      );
    }
  }

  // 修复 JavaScript/CSS 中的绝对路径引用
  // 将 /_expo/static 改为 /freyav3/_expo/static
  content = content.replace(/\/_expo\/static/g, '/freyav3/_expo/static');
  content = content.replace(/\/assets\//g, '/freyav3/assets/');
  
  // 修复 Expo Router 的路由路径
  // 确保所有以 / 开头的路径都加上 /freyav3 前缀（除了已经是 /freyav3 的）
  content = content.replace(/(["'])\/(?!freyav3)([^"']+)(["'])/g, '$1/freyav3/$2$3');
  
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

if (fs.existsSync(distDir)) {
  console.log('Fixing paths for GitHub Pages...');
  walkDir(distDir);
  console.log('Done!');
} else {
  console.error('dist/ directory not found!');
  process.exit(1);
}
