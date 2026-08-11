# 家庭菜单移动端与明亮配色 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 取消单餐菜品数量限制的移动端假象，并将界面更新为明亮愉悦的家庭厨房配色。

**Architecture:** 保持现有原生 JavaScript、Vite 和 IndexedDB 架构不变。领域层继续由 `appendDish` 负责去重，样式层通过可滚动编辑器和响应式安全区保证添加入口始终可达。

**Tech Stack:** JavaScript、CSS、Vite、pnpm、Node.js assert

## Global Constraints

- 每餐不同菜品没有数量上限。
- 同一道菜不能在同一餐重复添加。
- 不新增运行时依赖。
- GitHub Pages 仍使用相对路径构建。

---

### Task 1: 增加无限菜品与移动端回归测试

**Files:**
- Modify: `tests/domain.test.mjs`
- Create: `tests/mobile-ui.test.mjs`
- Modify: `package.json`

- [ ] 将单餐测试扩展到 12 道不同菜品，并验证重复菜品不会追加。
- [ ] 增加移动端 CSS 规则检查，要求编辑内容可滚动、底部安全区生效、触控目标不小于 44px。
- [ ] 运行 `pnpm test`，确认移动端样式测试因缺少规则而失败。

### Task 2: 修复移动端编辑器并更新明亮配色

**Files:**
- Modify: `src/styles.css`

- [ ] 更新颜色 token、侧栏、导航、卡片、选中状态和弹层颜色。
- [ ] 将编辑面板改为纵向布局，允许内容滚动，并限制已选菜品区域高度。
- [ ] 增加手机安全区、44px 触控目标和窄屏单列规则。
- [ ] 运行 `pnpm test` 和 `pnpm build`。

### Task 3: 隐藏当前餐次已选菜谱

**Files:**
- Modify: `tests/mobile-ui.test.mjs`
- Modify: `src/ui/editor-panel.js`

- [ ] 增加编辑器渲染测试，验证已选菜谱不出现在候选列表，未选菜谱仍可见。
- [ ] 在候选菜谱筛选中排除当前餐次已有的 `recipeId`。
- [ ] 运行 `pnpm test`。

### Task 4: 渲染验证与提交

**Files:**
- Verify: rendered application

- [ ] 在桌面、390px 和 320px 视口检查页面。
- [ ] 验证打开餐次后仍可持续录入不同菜品，编辑器不裁切。
- [ ] 精确暂存本次文件并使用 Conventional Commit 提交。
