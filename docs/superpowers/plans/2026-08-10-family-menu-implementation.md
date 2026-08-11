# 家庭菜单系统 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个无需账号、支持手机和电脑使用的家庭菜单本地 Web 应用。

**Architecture:** 使用原生 HTML/CSS/JavaScript 模块实现单页应用。通过 IndexedDB 保存菜谱、周菜单、历史菜单和采购清单；UI 层通过集中式状态渲染当前视图，规划器和数据层保持纯函数/独立接口。

**Tech Stack:** HTML5、CSS3、现代浏览器 ES Modules、IndexedDB、浏览器 File API；不引入第三方依赖，不需要包管理器。

## Global Constraints

- 无账号、无后端、默认离线可用。
- 支持手机和电脑自适应布局。
- 支持早餐、午餐、晚餐，每周 21 个餐格。
- 不自动计算人数和食材数量。
- 自动规划必须是确定性、可解释的本地规则，不调用外部 AI。
- 所有导入数据先校验，失败不得覆盖已有数据。

### Task 1: 创建应用骨架与基础样式

**Files:**
- Create: `index.html`
- Create: `src/styles.css`
- Create: `src/app.js`
- Create: `src/data/seed-recipes.js`

**Interfaces:**
- `index.html` 提供 `#app` 挂载点和 `src/app.js` 模块入口。
- `seed-recipes.js` 导出 `SEED_RECIPES` 数组。

- [ ] **Step 1: 创建语义化页面骨架**：包括侧边/底部导航、当前周菜单主区域、菜谱库、历史菜单、采购清单视图容器。
- [ ] **Step 2: 添加响应式样式**：桌面端周表格、移动端按天切换；为餐格、编辑面板、按钮、状态提示定义稳定尺寸和焦点样式。
- [ ] **Step 3: 准备至少 24 道覆盖早餐、午餐、晚餐及荤素汤主食分类的内置菜谱。**
- [ ] **Step 4: 添加基础渲染入口和空状态，确认 `index.html` 可直接打开。**

### Task 2: 实现本地数据层

**Files:**
- Create: `src/data/db.js`
- Create: `src/data/repository.js`
- Create: `src/data/backup.js`

**Interfaces:**
- `openDatabase(): Promise<IDBDatabase>`
- `repository.listRecipes(filters): Promise<Recipe[]>`
- `repository.saveRecipe(recipe): Promise<Recipe>`
- `repository.deleteRecipe(id): Promise<void>`
- `repository.getCurrentWeek(): Promise<WeeklyMenu>`
- `repository.saveWeek(week): Promise<void>`
- `repository.listArchivedWeeks(): Promise<WeeklyMenu[]>`
- `repository.saveShoppingList(list): Promise<void>`
- `exportSnapshot(): Promise<Blob>`
- `importSnapshot(file): Promise<void>`

- [ ] **Step 1: 写 IndexedDB 初始化和对象仓库创建逻辑**，数据库版本变更可幂等执行。
- [ ] **Step 2: 实现菜谱、周菜单、采购清单的 CRUD 仓储方法**，首次打开自动写入种子菜谱和空当前周。
- [ ] **Step 3: 实现 JSON 导出和版本化导入校验**，导入失败返回带上下文的错误。
- [ ] **Step 4: 在浏览器中验证刷新后数据仍然存在。**

### Task 3: 实现菜单规划与采购清单领域逻辑

**Files:**
- Create: `src/domain/planner.js`
- Create: `src/domain/shopping.js`
- Create: `tests/domain.test.html`

**Interfaces:**
- `planWeek({ recipes, history, existingEntries, seed }): MealEntry[]`
- `scoreRecipe(recipe, context): number`
- `buildShoppingItems({ week, recipes }): ShoppingItem[]`

- [ ] **Step 1: 编写浏览器测试页中的失败断言**：餐次过滤、近 7 天避重、同日主要食材去重、食材合并。
- [ ] **Step 2: 实现确定性评分器和规划器**：使用固定排序和可选 seed，确保同样输入得到同样结果。
- [ ] **Step 3: 实现采购清单生成**：按标准化食材名合并，并保留来源菜谱 ID。
- [ ] **Step 4: 运行 `tests/domain.test.html`，确认全部断言通过。**

### Task 4: 实现周菜单工作台与编辑面板

**Files:**
- Modify: `src/app.js`
- Create: `src/ui/week-view.js`
- Create: `src/ui/editor-panel.js`
- Create: `src/ui/menu-actions.js`

**Interfaces:**
- `renderWeekView(state, handlers): string`
- `openEditorPanel(target, context, handlers): void`
- `copyFromHistory(source, target): Promise<void>`

- [ ] **Step 1: 实现桌面端 7 天 × 3 餐表格**，支持空餐格、点击选中和保存状态。
- [ ] **Step 2: 实现手机端日期切换**，同一数据模型派生出当天三餐视图。
- [ ] **Step 3: 实现右侧编辑面板/移动端底部面板**：搜索菜谱、选择菜谱、新建菜谱、清空餐格。
- [ ] **Step 4: 实现桌面端拖拽菜谱到餐格**，并复用同一保存处理器。
- [ ] **Step 5: 实现手动录入临时菜名、撤销清空和一键自动规划。**

### Task 5: 实现历史菜单、今日菜单与采购清单视图

**Files:**
- Create: `src/ui/history-view.js`
- Create: `src/ui/today-view.js`
- Create: `src/ui/shopping-view.js`
- Modify: `src/app.js`

- [ ] **Step 1: 实现历史周列表和整周/单日/单餐复制动作。**
- [ ] **Step 2: 实现今日菜单派生视图，展示当天三餐、食材入口和临时备注。**
- [ ] **Step 3: 实现采购清单分类、勾选、手动新增、备注和已购清理。**
- [ ] **Step 4: 将当前周变更同步到历史和采购清单仓储。**

### Task 6: 备份、可访问性与端到端验收

**Files:**
- Modify: `index.html`
- Modify: `src/styles.css`
- Modify: `src/app.js`
- Create: `README.md`

- [ ] **Step 1: 添加导出/导入入口、数据版本显示和失败提示。**
- [ ] **Step 2: 检查键盘焦点、按钮名称、表单标签和移动端触控尺寸。**
- [ ] **Step 3: 使用本地静态服务器运行应用，验证完整流程：新增菜谱 -> 填写/复制周菜单 -> 自动规划 -> 采购清单 -> 导出/导入。**
- [ ] **Step 4: 分别在窄屏和宽屏浏览器中检查无横向溢出、遮挡或布局跳动。**
- [ ] **Step 5: 在 README 中写明启动方式、数据存储位置和备份恢复步骤。**
