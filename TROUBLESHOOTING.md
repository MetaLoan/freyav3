# GitHub Pages 部署排查指南

## 遇到 404 错误？

### 步骤 1: 检查 GitHub Actions 运行状态

1. 进入仓库的 Actions 标签页：https://github.com/MetaLoan/freyav3/actions
2. 查看最新的工作流运行
3. 确认 "Build Web App" 任务是否成功完成
4. 检查 "Deploy to GitHub Pages" 步骤是否有错误

### 步骤 2: 启用 GitHub Pages

1. 进入仓库设置：https://github.com/MetaLoan/freyav3/settings/pages
2. 在 "Source" 部分，选择 **"GitHub Actions"**
3. 点击 "Save"

### 步骤 3: 检查工作流权限

1. 进入仓库设置：https://github.com/MetaLoan/freyav3/settings/actions
2. 找到 "Workflow permissions"
3. 选择 **"Read and write permissions"**
4. 勾选 "Allow GitHub Actions to create and approve pull requests"
5. 保存设置

### 步骤 4: 等待部署完成

- GitHub Pages 部署通常需要 1-5 分钟
- 部署完成后，访问：https://metaloan.github.io/freyav3/
- 如果还是 404，等待几分钟后刷新

### 步骤 5: 检查 gh-pages 分支

1. 进入仓库的 "Branches" 页面
2. 查看是否存在 `gh-pages` 分支
3. 如果存在，检查分支中是否有文件

### 步骤 6: 手动触发部署

如果自动部署失败，可以：

1. 进入 Actions 页面
2. 选择 "Build and Deploy" 工作流
3. 点击 "Run workflow"
4. 选择 main 分支
5. 点击 "Run workflow" 按钮

## 常见问题

### Q: Actions 显示成功但页面还是 404

**A:** 可能是 GitHub Pages 还没有启用，或者需要等待几分钟让 CDN 更新。

### Q: 权限错误 (403)

**A:** 确保在仓库设置中启用了 "Read and write permissions"。

### Q: 构建失败

**A:** 检查 Actions 日志，查看具体错误信息。常见问题：
- 依赖安装失败
- TypeScript 类型错误
- 构建命令错误

### Q: 如何查看部署日志？

**A:** 在 Actions 页面，点击具体的工作流运行，查看 "Deploy to GitHub Pages" 步骤的详细日志。

## 验证部署

部署成功后，你应该能看到：
- `gh-pages` 分支被创建或更新
- 在仓库设置中，Pages 显示 "Your site is live at https://metaloan.github.io/freyav3/"
- 访问 URL 可以看到应用界面（而不是 404）
