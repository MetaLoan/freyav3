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
  let modified = false;

  // 修复 HTML 中的绝对路径
  if (filePath.endsWith('.html')) {
    // 添加 base tag（如果不存在）
    if (!content.includes('<base')) {
      content = content.replace(
        '<head>',
        `<head>\n    <base href="/freyav3/">`
      );
      modified = true;
    }
  }

  // 修复 JavaScript/CSS 中的绝对路径引用
  // 将 /_expo/static 改为相对路径
  content = content.replace(/\/_expo\/static/g, './_expo/static');
  content = content.replace(/\/assets\//g, './assets/');
  
  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    modified = true;
  }

  return modified;
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
