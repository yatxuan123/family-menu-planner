# pnpm 与 GitHub Pages 部署设计

## 目标

将家庭菜单应用转换为 `pnpm + Vite` 静态前端工程，并通过 GitHub Actions 部署到 GitHub Pages。

## 工程结构

- `package.json`：声明 Vite、开发/构建/预览/测试命令。
- `vite.config.js`：使用相对 `base`，确保项目 Pages 路径可用。
- `public/`：存放图标和 Web App Manifest，构建时原样复制。
- `.github/workflows/deploy-pages.yml`：构建并部署 `dist/`。

## 图标

主图标为简洁的餐盘与菜叶图形，使用深绿色、暖白和少量橙色。保存 SVG 主文件，并生成 `icon-192.png`、`icon-512.png`、`apple-touch-icon.png`。页面同时引用 SVG favicon 和 Manifest。

## 部署

推送到 `main` 后，Actions 使用 pnpm 安装锁定依赖、运行测试和构建，然后通过官方 Pages Action 发布。仓库需要在 GitHub Pages 设置中选择 `GitHub Actions` 作为来源。

## 限制

当前本地仓库没有 GitHub remote，且系统没有 `gh` 命令。完成本地工程和提交后，必须提供目标 GitHub 仓库地址或完成 GitHub CLI 登录，才能实际推送和获得公开 URL。
