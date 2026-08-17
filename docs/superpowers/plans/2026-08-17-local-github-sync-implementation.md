# 家庭菜单本地优先与 GitHub 手动同步实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 `localStorage` 保存完整家庭菜单快照，并支持通过 GitHub JSON 文件手动读取和保存。

**Architecture:** 新建独立的本地存储与远程同步模块，保留现有 repository 公共接口。应用启动先加载本地缓存，再用同站点 JSON 覆盖；用户操作后即时保存本地，GitHub 保存使用 Contents API SHA 防并发覆盖。

**Tech Stack:** 原生 JavaScript、Vite、Node.js 断言测试、GitHub Contents API、pnpm

**Spec:** `docs/superpowers/specs/2026-08-17-local-github-sync-design.md`

## Global Constraints

- 包管理器固定为 pnpm。
- 不使用 Git 命令、Worker、IndexedDB 或数据库。
- 本地数据 Key 固定为 `family-menu-data-v1`。
- Token 仅保存到 `sessionStorage` 的 `family-menu-github-token`。
- 远程仓库固定为 `yatxuan123/family-menu-planner`，文件固定为 `data/family-menu-data.json`。
- GitHub 仓库和 JSON 历史公开可见。

---

### Task 1: 本地快照存储与 repository

**Files:**
- Create: `src/data/storage.js`
- Modify: `src/data/repository.js`
- Test: `tests/storage-remote.test.mjs`

**Interfaces:**
- Produces: `createEmptySnapshot()`、`validateSnapshot(snapshot)`、`loadLocalSnapshot(storage)`、`saveLocalSnapshot(snapshot, storage)`；保持现有 `repository` 方法。

- [ ] 编写空缓存、损坏 JSON、完整替换和即时保存的失败测试。
- [ ] 运行 `pnpm test`，确认测试因模块不存在或行为缺失而失败。
- [ ] 实现快照校验和 localStorage 读写。
- [ ] 将 repository 改为基于完整快照的同步持久化，同时保留异步公共接口。
- [ ] 运行 `pnpm test`，确认存储测试通过。

### Task 2: GitHub 远程读写

**Files:**
- Create: `src/data/remote.js`
- Test: `tests/storage-remote.test.mjs`

**Interfaces:**
- Produces: `loadBundledSnapshot(fetchImpl)`、`loadRemoteSnapshot(fetchImpl)`、`saveRemoteSnapshot(snapshot, token, fetchImpl)`、`RemoteConflictError`。

- [ ] 编写 raw JSON 读取、SHA + PUT、UTF-8 Base64、HTTP 错误和 `409` 冲突的失败测试。
- [ ] 运行目标测试，确认因远程模块不存在而失败。
- [ ] 实现同站点加载、公开 raw 读取和 Contents API 保存。
- [ ] 运行目标测试和全量测试，确认通过。

### Task 3: 设置页同步交互与移动端入口

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `tests/mobile-ui.test.mjs`

**Interfaces:**
- Consumes: Task 1 的 `repository.replaceAll/exportAll`，Task 2 的加载与保存函数。

- [ ] 编写设置页 GitHub 控件、公开性提示和移动端“数据”入口的失败测试。
- [ ] 运行 `pnpm test`，确认 UI 测试失败。
- [ ] 实现启动覆盖、确认读取、Token 会话保存、远程保存和冲突提示。
- [ ] 调整设置页和六项移动导航样式。
- [ ] 运行 `pnpm test`，确认全部测试通过。

### Task 4: 初始数据与文档

**Files:**
- Create: `data/family-menu-data.json`
- Modify: `vite.config.js`
- Modify: `README.md`

**Interfaces:**
- Produces: GitHub Pages 可访问的初始完整快照及使用说明。

- [ ] 添加版本 1 的完整初始 JSON 快照，并由 Vite 在开发和构建时提供同一根目录数据源。
- [ ] 更新本地存储、GitHub Token 权限、公开性、冲突处理和 Pages 延迟说明。
- [ ] 运行 `pnpm test`。
- [ ] 运行 `pnpm build`，确认静态数据文件进入构建产物。

> 按用户要求，本计划不执行 Git 暂存、提交、合并或推送操作。
