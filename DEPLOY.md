# 部署说明

## 本地访问静态页面

### 1. 构建静态文件

```bash
# 安装依赖（如果还没安装）
npm install

# 构建 Web 应用
npx expo export -p web
```

### 2. 启动本地服务器

构建完成后，静态文件会输出到 `dist/` 目录。你可以使用以下方式访问：

#### 方式一：使用 Python 简单服务器

```bash
cd dist
python3 -m http.server 8000
```

然后在浏览器访问：`http://localhost:8000`

#### 方式二：使用 Node.js serve

```bash
npm install -g serve
serve -s dist -l 8000
```

#### 方式三：使用 npx serve（无需安装）

```bash
npx serve -s dist -l 8000
```

## GitHub Pages 自动部署

项目已配置 GitHub Actions，每次推送到 `main` 分支时会自动：

1. 构建 Web 应用
2. 部署到 GitHub Pages

### 访问地址

部署完成后，可以通过以下地址访问：

```
https://metaloan.github.io/freyav3/
```

### 启用 GitHub Pages

1. 进入 GitHub 仓库设置：https://github.com/MetaLoan/freyav3/settings
2. 找到左侧菜单的 "Pages" 设置
3. Source 选择 "GitHub Actions"
4. 保存设置

### 权限设置

如果遇到 403 权限错误，请确保：

1. 进入仓库 Settings → Actions → General
2. 找到 "Workflow permissions"
3. 选择 "Read and write permissions"
4. 勾选 "Allow GitHub Actions to create and approve pull requests"
5. 保存设置

工作流已配置 `permissions`，应该可以正常部署。

## 其他部署选项

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### 自定义域名

如果需要使用自定义域名，可以在 GitHub Pages 设置中添加 CNAME 文件。
