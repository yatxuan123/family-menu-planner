# 家庭菜单本地优先与 GitHub 手动同步设计

## 目标

将现有 IndexedDB 数据层替换为 `localStorage`，并提供公开 GitHub JSON 文件的手动读取和保存能力。应用不使用数据库、Worker 或 Git 命令，继续部署为 GitHub Pages 静态站点。

## 数据格式

所有功能共享一个版本化快照：

```json
{
  "version": 1,
  "recipes": [],
  "weeks": [],
  "shopping": [],
  "settings": []
}
```

快照包含菜谱、本周及历史菜单、采购清单和设置。`localStorage` Key 为 `family-menu-data-v1`。GitHub Token 使用 `sessionStorage` Key `family-menu-github-token`，只在当前浏览器会话中有效。

## 架构

- `src/data/storage.js`：校验、读取和覆盖完整快照，负责 `localStorage` 持久化。
- `src/data/repository.js`：保留现有公共接口，在每次新增、编辑或删除后立即将完整快照写回本地存储。
- `src/data/remote.js`：读取同站点初始 JSON、读取公开 GitHub raw 文件、通过 Contents API 获取 SHA 并 PUT 保存。
- `src/app.js`：启动同步流程和设置页交互；远程覆盖前弹出确认，保存冲突时提示重新读取。

原 `repository` 的方法名称保持不变，避免菜单、历史、菜谱和采购页面发生无关重构。`src/data/db.js` 不再被应用引用。

## 数据流

启动时先读取 `localStorage`，随后请求 `./data/family-menu-data.json`。请求成功且数据有效时，用文件内容完整覆盖本地缓存，再执行内置菜谱与当前周初始化；请求失败时显示非阻断提示并继续使用已有本地缓存。

日常新增、编辑和删除通过 `repository` 修改快照，并立即调用本地保存。导入备份和 GitHub 读取都使用完整替换语义。

“读取 GitHub”访问：

```text
https://raw.githubusercontent.com/yatxuan123/family-menu-planner/main/data/family-menu-data.json
```

读取并校验成功后先要求用户确认，再覆盖本地缓存并刷新页面状态。

“保存 GitHub”先访问：

```text
https://api.github.com/repos/yatxuan123/family-menu-planner/contents/data/family-menu-data.json
```

手动读取时同时获取当前文件 SHA，并把它作为当前会话的同步基准。保存前重新读取远程 SHA，只有它仍与基准一致时才使用 Fine-grained Token 和 Contents API PUT 完整快照，提交信息为 `chore: 更新家庭菜单数据`。Token 需要仓库 `Contents: Read and write` 权限。

## 并发与错误处理

PUT 请求携带上次手动读取的基准 SHA。保存前发现远程 SHA 已变化，或 GitHub PUT 返回 `409` 时，均抛出专用冲突错误，页面提示“远程数据已变化，请先读取 GitHub 后再保存”。首次保存前必须先读取 GitHub。网络失败、无权限、JSON 无效和本地数据损坏均返回带上下文的中文错误。

Token 不写入 `localStorage`、快照、DOM 字符串或日志。关闭浏览器会话后由浏览器自动清除。

## 界面

“数据与备份”页面保留本地 JSON 导入导出，并新增 GitHub 同步区：Token 密码输入框、“读取 GitHub”和“保存 GitHub”按钮、公开数据风险说明。移动端底部导航包含“数据”，保证手机可完成同步。

## 测试

- 存储测试：空存储、合法快照、损坏 JSON、完整替换、数据修改即时持久化。
- 远程测试：raw 读取、SHA + PUT 请求、UTF-8 Base64、无权限错误、`409` 冲突。
- UI 静态测试：设置页控件、移动端数据入口、公开仓库提示。
- 全量验证：`pnpm test` 与 `pnpm build`。

## 公开性限制

仓库为公开仓库，因此 `data/family-menu-data.json` 的当前内容和每次保存形成的 Git 历史均公开。此根目录文件是唯一数据源，Vite 开发服务直接提供它，构建时复制到 `dist/data/`。GitHub Pages 站点中的同项目文件可能等待部署后才更新，但“读取 GitHub”直接访问 raw 文件，可读取主分支最新内容。空的初始文件不会覆盖已经包含数据的浏览器缓存。
