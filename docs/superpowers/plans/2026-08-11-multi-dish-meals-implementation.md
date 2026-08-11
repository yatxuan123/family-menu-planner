# 多菜餐次 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 允许每个早餐、午餐和晚餐餐格包含多道独立菜品。

**Architecture:** 增加餐格归一化函数作为新旧数据边界，领域逻辑和 UI 统一消费 `{ dishes: Dish[] }`。规划器按餐次目标数量追加菜品，采购模块遍历所有 `dishes`。

**Tech Stack:** 原生 JavaScript ES Modules、IndexedDB、浏览器测试页。

## Global Constraints

- 不引入第三方依赖。
- 现有单菜数据必须兼容且不丢失。
- 早餐默认 2 道，午餐和晚餐默认 3 道。
- 用户已有菜品不得被自动规划覆盖。

### Task 1: 餐格归一化与领域测试

**Files:**
- Create: `src/domain/meals.js`
- Modify: `tests/domain.test.html`

- [ ] 添加旧单菜转为 `dishes` 数组的失败测试。
- [ ] 添加向同一餐追加两道菜的失败测试。
- [ ] 实现 `normalizeMealEntry(entry)`、`appendDish(entry, dish)` 和 `removeDish(entry, index)`。
- [ ] 运行浏览器测试确认通过。

### Task 2: 多菜自动规划与采购汇总

**Files:**
- Modify: `src/domain/planner.js`
- Modify: `src/domain/shopping.js`
- Modify: `tests/domain.test.html`

- [ ] 添加早餐 2 道、午晚餐 3 道的失败测试。
- [ ] 添加采购模块遍历同餐多道菜的失败测试。
- [ ] 修改规划器为餐次补齐目标数量。
- [ ] 修改采购模块遍历全部 `dishes`。
- [ ] 运行全部领域测试确认通过。

### Task 3: 更新菜单编辑与展示

**Files:**
- Modify: `src/app.js`
- Modify: `src/ui/week-view.js`
- Modify: `src/ui/editor-panel.js`
- Modify: `src/styles.css`

- [ ] 选择菜谱和直接录入改为追加菜品。
- [ ] 编辑面板显示当前餐全部菜品并支持单独删除。
- [ ] 桌面和移动餐格展示多行菜名。
- [ ] 保留整餐清空、撤销和拖拽追加。

### Task 4: 更新今日、历史和采购链路

**Files:**
- Modify: `src/ui/today-view.js`
- Modify: `src/ui/history-view.js`
- Modify: `src/app.js`

- [ ] 今日菜单展示多道菜及全部食材。
- [ ] 历史复制深拷贝 `dishes` 数组。
- [ ] 归档、导入和现有 IndexedDB 数据在加载时归一化。

### Task 5: 浏览器回归

- [ ] 验证同餐连续添加两道菜。
- [ ] 验证删除单道菜和清空整餐。
- [ ] 验证自动规划数量和采购清单。
- [ ] 验证桌面与 390px 移动端无溢出和控制台错误。
