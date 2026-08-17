# 家庭菜单

一周三餐规划工具，支持每餐多道菜、历史菜单和采购清单。项目仓库名建议使用 `family-menu-planner`。

## 运行

使用 pnpm 安装依赖并启动开发服务器：

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm test
pnpm build
pnpm preview
```

应用使用现代浏览器的 IndexedDB，数据保存在当前浏览器的本地站点存储中。

## 功能

- 当前周三餐菜单：手动录入、菜谱选择、拖拽排餐、自动规划
- 菜谱库：内置菜谱、新增、编辑、删除、搜索和分类筛选
- 历史菜单：归档并复制整周、单日或单餐
- 采购清单：按当前菜单汇总食材、手动新增和勾选购买状态
- 数据备份：导出和导入 JSON 快照

## 备份建议

在“数据”页面点击“导出备份”下载 JSON 文件。恢复时选择此前导出的文件；导入会先校验版本和数据结构，失败不会覆盖已有数据。

## 领域测试

浏览器打开 `tests/domain.test.html` 可以运行菜单规划与采购清单的基础测试。

## GitHub Pages

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会执行测试、构建并部署 `dist/`。

首次部署时，在 GitHub 仓库中打开 **Settings → Pages**，将 **Source** 设置为 **GitHub Actions**。之后每次推送到 `main` 都会自动更新页面。
