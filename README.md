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

应用使用浏览器 `localStorage` 保存完整数据快照，Key 为 `family-menu-data-v1`。每次新增、编辑或删除都会立即保存，不需要数据库或后台服务。

## 功能

- 当前周三餐菜单：手动录入、菜谱选择、拖拽排餐、自动规划
- 菜谱库：内置菜谱、新增、编辑、删除、搜索和分类筛选
- 历史菜单：归档并复制整周、单日或单餐
- 采购清单：按当前菜单汇总食材、手动新增和勾选购买状态
- 数据备份：导出和导入 JSON 快照
- GitHub 同步：手动读取公开 JSON，或使用 Fine-grained Token 手动保存

## 备份建议

在“数据”页面点击“导出备份”下载 JSON 文件。恢复时选择此前导出的文件；导入会先校验版本和数据结构，校验成功后完整替换当前浏览器数据。

## GitHub 手动同步

启动时应用会先读取浏览器缓存，再自动请求 GitHub raw 文件。远程数据有效且非空时会立即覆盖浏览器缓存并刷新当前界面；读取失败时继续使用原有本地缓存，并在“数据”页持续显示同步状态。

“读取 GitHub”直接访问公开文件：

```text
https://raw.githubusercontent.com/yatxuan123/family-menu-planner/main/data/family-menu-data.json
```

手动读取并校验成功后，页面会要求确认，再用远程快照替换当前浏览器数据并立即更新当前界面，不需要刷新页面。读取过程只访问公开 raw 文件，并在浏览器本地按 Git Blob 规则计算 SHA，不消耗 GitHub API 的匿名请求额度。

“保存 GitHub”需要输入拥有仓库 `Contents: Read and write` 权限的 Fine-grained Token。Token 仅保存于当前浏览器会话的 `sessionStorage`，Key 为 `family-menu-github-token`，关闭浏览器后失效。首次保存前必须先点击“读取 GitHub”，应用会记录当时的文件 SHA；保存前再次检查远程 SHA，发现其他设备已更新时会拒绝覆盖并要求重新读取。校验通过后通过 GitHub Contents API PUT 更新文件并生成提交 `chore: 更新家庭菜单数据`。

> 仓库是公开仓库，因此 JSON 当前内容和每次保存产生的 Git 历史都公开可见。不要在菜单数据中保存隐私或敏感信息。

GitHub Pages 站点内的 JSON 更新需要等待部署完成；“读取 GitHub”访问 raw 文件，不受 Pages 部署延迟影响。

仓库根目录的 `data/family-menu-data.json` 是唯一远程数据源。Vite 开发服务直接提供此文件，生产构建会将其复制到 `dist/data/family-menu-data.json`，避免仓库 API 路径与 Pages 文件不一致。

## 领域测试

浏览器打开 `tests/domain.test.html` 可以运行菜单规划与采购清单的基础测试。

## GitHub Pages

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会执行测试、构建并部署 `dist/`。

首次部署时，在 GitHub 仓库中打开 **Settings → Pages**，将 **Source** 设置为 **GitHub Actions**。之后每次推送到 `main` 都会自动更新页面。
