#!/usr/bin/env node

/**
 * 创建 404.html 用于 GitHub Pages SPA 路由
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(notFoundPath, indexContent, 'utf8');
  console.log('Created 404.html for GitHub Pages SPA routing');
} else {
  console.error('index.html not found in dist/');
  process.exit(1);
}
