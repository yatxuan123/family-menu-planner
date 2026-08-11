# pnpm 与 GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 pnpm/Vite 构建家庭菜单，并配置 GitHub Pages 自动部署和应用图标。

**Architecture:** Vite 构建现有原生 ES Modules，`public/` 提供静态图标和 Manifest，GitHub Actions 发布 `dist/`。使用相对 base 兼容任意仓库名。

**Tech Stack:** pnpm、Vite、GitHub Actions、GitHub Pages、SVG/PNG。

## Global Constraints

- 包管理器必须使用 pnpm。
- 不改变现有业务数据和 IndexedDB 行为。
- Pages 必须使用 GitHub Actions 部署。
- 图标必须适用于 favicon 和移动设备桌面图标。

### Task 1: Vite 工程化

- [ ] 创建 `package.json`、`vite.config.js` 和 `.gitignore`。
- [ ] 移除手写模块缓存查询参数，由 Vite 资源哈希处理。
- [ ] 运行 `pnpm install` 生成 `pnpm-lock.yaml`。
- [ ] 运行测试和生产构建。

### Task 2: 图标与 Manifest

- [ ] 创建 `public/icon.svg`。
- [ ] 生成 192px、512px 和 Apple Touch PNG。
- [ ] 创建 `public/manifest.webmanifest` 并更新 `index.html`。
- [ ] 检查图标文件尺寸和透明通道。

### Task 3: GitHub Pages 工作流

- [ ] 创建 `.github/workflows/deploy-pages.yml`。
- [ ] 工作流执行 `pnpm install --frozen-lockfile`、测试和构建。
- [ ] 使用官方 Pages Actions 上传并部署 `dist/`。
- [ ] 检查 YAML、构建产物和相对资源路径。

### Task 4: Git 发布准备

- [ ] 精确检查并暂存项目文件，排除 `.DS_Store` 和 `.superpowers/`。
- [ ] 创建符合 Conventional Commits 的首次本地提交。
- [ ] 获取目标 GitHub 仓库并配置 `origin`。
- [ ] 推送 `main`，等待 Pages 工作流并报告 URL。
