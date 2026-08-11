import { ensureInitialized, repository, createEmptyWeek, id } from "./data/repository.js";
import { downloadBackup, restoreBackup } from "./data/backup.js";
import { planWeek } from "./domain/planner.js";
import { buildShoppingItems } from "./domain/shopping.js";
import { appendDish, normalizeWeek, removeDish } from "./domain/meals.js";
import { renderWeekView } from "./ui/week-view.js";
import { renderEditorPanel } from "./ui/editor-panel.js";
import { renderTodayView } from "./ui/today-view.js";
import { renderRecipesView } from "./ui/recipes-view.js";
import { renderHistoryView } from "./ui/history-view.js";
import { renderShoppingView } from "./ui/shopping-view.js";

const NAV = [
  ["week", "本周菜单"],
  ["today", "今日"],
  ["recipes", "菜谱库"],
  ["history", "历史"],
  ["shopping", "采购"],
  ["settings", "数据"],
];

const state = {
  view: "week",
  recipes: [],
  week: null,
  history: [],
  shopping: { items: [] },
  selectedDay: Math.max(0, (new Date().getDay() || 7) - 1),
  selectedSlot: null,
  recipeQuery: "",
  libraryQuery: "",
  categoryFilter: "全部",
  recipeFormOpen: false,
  editingRecipe: null,
  toast: null,
  undo: null,
  confirmAction: null,
};

const app = document.querySelector("#app");

async function loadState() {
  await ensureInitialized();
  state.recipes = await repository.listRecipes();
  state.week = normalizeWeek(await repository.getCurrentWeek() || createEmptyWeek());
  state.history = (await repository.listArchivedWeeks()).map(normalizeWeek);
  state.shopping = await repository.getShopping(state.week.id) || { id: state.week.id, weekId: state.week.id, items: [] };
}

function navigation(mobile = false) {
  const items = NAV.filter(([key]) => !mobile || key !== "settings");
  return `<nav class="${mobile ? "mobile-nav" : "app-nav"}" aria-label="主导航">${items.map(([key, label]) => `<button class="nav-button ${state.view === key ? "active" : ""}" data-view="${key}">${label}</button>`).join("")}</nav>`;
}

function renderSettings() {
  return `<section class="view-shell"><header class="view-header"><div><span class="eyebrow">本地数据版本 1</span><h1>数据与备份</h1><p>所有数据仅保存在当前浏览器，请定期导出备份。</p></div></header><div class="settings-list"><div class="settings-row"><div><strong>导出完整备份</strong><p>下载菜谱、菜单历史和采购清单的 JSON 文件。</p></div><button class="button primary" data-action="export">导出备份</button></div><div class="settings-row"><div><strong>导入并恢复</strong><p>校验通过后导入数据；现有同 ID 数据会被更新。</p></div><label class="button secondary">选择文件<input hidden type="file" accept="application/json" data-input="import"></label></div><div class="settings-row"><div><strong>数据概览</strong><p>${state.recipes.length} 道菜谱，${state.history.length} 周历史菜单，当前周 ${Object.keys(state.week.entries).length}/21 餐已安排。</p></div></div></div></section>`;
}

function renderView() {
  if (state.view === "today") return renderTodayView(state);
  if (state.view === "recipes") return renderRecipesView(state);
  if (state.view === "history") return renderHistoryView(state);
  if (state.view === "shopping") return renderShoppingView(state);
  if (state.view === "settings") return renderSettings();
  return renderWeekView(state);
}

function render() {
  app.innerHTML = `<div class="app-shell"><aside class="app-sidebar"><div class="brand"><span class="brand-mark">家</span><div><strong>家常菜单</strong><small>多菜餐次版</small></div></div>${navigation()}<div class="sidebar-footer">数据保存在此浏览器<br>建议定期导出备份</div></aside><main class="app-main">${renderView()}</main>${navigation(true)}</div>${state.toast ? `<div class="toast ${state.toast.type || ""}">${state.toast.message}${state.undo ? ` <button class="text-button" data-action="undo" style="color:white">撤销</button>` : ""}</div>` : ""}${state.confirmAction ? `<div class="modal-backdrop"><div class="modal confirm-modal"><span class="eyebrow">请确认</span><h2>${state.confirmAction.title}</h2><p>${state.confirmAction.message}</p><div class="modal-actions"><span></span><span></span><button class="button ghost" data-action="cancel-confirm">取消</button><button class="button primary" data-action="${state.confirmAction.confirmAction}">确认</button></div></div></div>` : ""}`;
  const editor = document.querySelector("#editor-panel");
  if (editor) editor.innerHTML = renderEditorPanel(state);
}

function notify(message, type = "") {
  state.toast = { message, type };
  render();
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => { state.toast = null; state.undo = null; render(); }, 3200);
}

async function saveWeek(message) {
  await repository.saveWeek(state.week);
  if (message) notify(message);
  else render();
}

async function refreshShopping() {
  state.shopping.items = buildShoppingItems({ week: state.week, recipes: state.recipes, previous: state.shopping.items });
  await repository.saveShopping(state.shopping);
}

function appendToSlot(slot, dish) {
  state.week.entries = { ...state.week.entries, [slot]: appendDish(state.week.entries[slot], dish) };
}

function ingredientCategory(name) {
  if (name === "牛奶") return "蔬菜及其他";
  if (/[鸡鸭猪牛羊肉排骨火腿蛋]/.test(name)) return "肉蛋";
  if (/[鱼虾贝]/.test(name)) return "水产";
  if (/[米面粉燕麦馒头面包]/.test(name)) return "主食";
  if (/[盐糖油酱醋葱姜蒜]/.test(name)) return "调味料";
  return "蔬菜及其他";
}

async function chooseRecipe(recipeId) {
  if (!state.selectedSlot) return;
  const recipe = state.recipes.find((item) => item.id === recipeId);
  if (!recipe) return;
  appendToSlot(state.selectedSlot, { recipeId: recipe.id, name: recipe.name, source: "library" });
  await saveWeek("菜品已添加，可继续选择");
}

async function saveRecipe(form) {
  const data = new FormData(form);
  const ingredientNames = String(data.get("ingredients") || "").split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean);
  const meals = data.getAll("meals");
  if (!meals.length) throw new Error("至少选择一个适用餐次。");
  const existing = state.recipes.find((item) => item.id === form.dataset.recipeId);
  await repository.saveRecipe({
    ...existing,
    id: existing?.id,
    name: data.get("name").trim(),
    category: data.get("category"),
    meals,
    minutes: Number(data.get("minutes")) || 20,
    difficulty: data.get("difficulty"),
    ingredients: ingredientNames.map((name) => ({ name, category: ingredientCategory(name) })),
    steps: data.get("steps").trim(),
    notes: data.get("notes").trim(),
    flavor: existing?.flavor || [],
    favorite: existing?.favorite || false,
  });
  state.recipes = await repository.listRecipes();
  state.recipeFormOpen = false;
  state.editingRecipe = null;
  notify("菜谱已保存");
}

function historyWeek(weekId) {
  return state.history.find((week) => week.id === weekId);
}

async function copyEntries(source, predicate) {
  if (!source) return;
  Object.entries(source.entries || {}).forEach(([key, value]) => { if (predicate(key)) state.week.entries[key] = structuredClone(normalizeWeek({ entries: { [key]: value } }).entries[key]); });
  await saveWeek("已从历史菜单复制");
}

app.addEventListener("click", async (event) => {
  const target = event.target.closest("button, [data-action], [data-view], [data-open-slot], [data-delete-recipe]");
  if (!target) return;
  try {
    if (target.dataset.view) { state.view = target.dataset.view; state.selectedSlot = null; render(); return; }
    if (target.dataset.day !== undefined) { state.selectedDay = Number(target.dataset.day); render(); return; }
    if (target.dataset.slot) { state.selectedSlot = target.dataset.slot; state.recipeQuery = ""; render(); return; }
    if (target.dataset.openSlot) { state.view = "week"; state.selectedDay = Number(target.dataset.openSlot.split("-")[0]); state.selectedSlot = target.dataset.openSlot; render(); return; }
    if (target.dataset.selectRecipe) { await chooseRecipe(target.dataset.selectRecipe); return; }
    if (target.dataset.removeDish !== undefined) {
      const updated = removeDish(state.week.entries[state.selectedSlot], Number(target.dataset.removeDish));
      if (updated.dishes.length) state.week.entries[state.selectedSlot] = updated;
      else delete state.week.entries[state.selectedSlot];
      await saveWeek("菜品已移除"); return;
    }
    if (target.dataset.editRecipe) { state.editingRecipe = state.recipes.find((item) => item.id === target.dataset.editRecipe); state.recipeFormOpen = true; render(); return; }
    if (target.dataset.category) { state.categoryFilter = target.dataset.category; render(); return; }
    if (target.dataset.deleteRecipe) {
      state.confirmAction = { title: "删除这道菜谱？", message: "菜谱库中将不再显示它，历史菜单中的已安排名称仍会保留。", confirmAction: `confirm-delete-recipe:${target.dataset.deleteRecipe}` };
      render(); return;
    }
    if (target.dataset.copyWeek) { await copyEntries(historyWeek(target.dataset.copyWeek), () => true); return; }
    if (target.dataset.copyDay) { const [weekId, day] = target.dataset.copyDay.split(":"); await copyEntries(historyWeek(weekId), (key) => key.startsWith(`${day}-`)); return; }
    if (target.dataset.copyMeal) { const [weekId, day, meal] = target.dataset.copyMeal.split(":"); await copyEntries(historyWeek(weekId), (key) => key === `${day}-${meal}`); return; }
    const action = target.dataset.action;
    if (action === "close-editor") { state.selectedSlot = null; render(); }
    if (action === "go-recipes") { state.view = "recipes"; state.selectedSlot = null; render(); }
    if (action === "new-recipe") { state.editingRecipe = null; state.recipeFormOpen = true; render(); }
    if (action === "close-recipe-form") { state.recipeFormOpen = false; state.editingRecipe = null; render(); }
    if (action === "clear-slot") {
      const slot = state.selectedSlot; const previous = state.week.entries[slot]; delete state.week.entries[slot]; state.selectedSlot = null;
      state.undo = async () => { state.week.entries[slot] = previous; await saveWeek("已恢复菜单"); };
      await repository.saveWeek(state.week); notify("已清空此餐");
    }
    if (action === "undo" && state.undo) { const undo = state.undo; state.undo = null; await undo(); }
    if (action === "auto-plan") { state.week.entries = planWeek({ recipes: state.recipes, history: state.history.slice(0, 2), existingEntries: state.week.entries, seed: state.week.startDate }); await saveWeek("已规划所有空餐，可继续调整"); }
    if (action === "clear-week") {
      if (!Object.keys(state.week.entries).length) return;
      state.confirmAction = { title: "清空本周菜单？", message: "当前周的 21 个餐格将被清空，菜谱和历史记录不会删除。", confirmAction: "confirm-clear-week" };
      render();
    }
    if (action === "cancel-confirm") { state.confirmAction = null; render(); }
    if (action?.startsWith("confirm-delete-recipe:")) {
      await repository.deleteRecipe(action.split(":")[1]); state.recipes = await repository.listRecipes(); state.recipeFormOpen = false; state.editingRecipe = null; state.confirmAction = null; render(); notify("菜谱已删除");
    }
    if (action === "confirm-clear-week") {
      const previousEntries = structuredClone(state.week.entries);
      state.week.entries = {};
      state.confirmAction = null;
      state.undo = async () => { state.week.entries = previousEntries; await saveWeek("已恢复本周菜单"); };
      await repository.saveWeek(state.week);
      notify("本周菜单已清空");
    }
    if (action === "archive-week") {
      if (!Object.keys(state.week.entries).length) { notify("当前周还没有菜单，无法归档", "error"); return; }
      const archived = { ...structuredClone(state.week), id: `archive-${state.week.startDate}-${Date.now()}`, status: "archived" };
      await repository.archiveWeek(archived);
      state.history = await repository.listArchivedWeeks();
      notify("本周菜单已保存到历史记录");
    }
    if (action === "refresh-shopping") { await refreshShopping(); notify("采购清单已从本周菜单更新"); }
    if (action === "clear-checked") { state.shopping.items = state.shopping.items.filter((item) => !item.checked); await repository.saveShopping(state.shopping); notify("已清理购买完成的项目"); }
    if (action === "export") { await downloadBackup(); notify("备份文件已生成"); }
  } catch (error) { notify(error.message || "操作失败", "error"); }
});

app.addEventListener("input", (event) => {
  const input = event.target;
  if (input.dataset.input === "recipe-query") { state.recipeQuery = input.value; const editor = document.querySelector("#editor-panel"); if (editor) editor.innerHTML = renderEditorPanel(state); }
  if (input.dataset.input === "library-query") { state.libraryQuery = input.value; render(); document.querySelector('[data-input="library-query"]')?.focus(); }
});

app.addEventListener("change", async (event) => {
  try {
    const input = event.target;
    if (input.dataset.shoppingCheck) { const item = state.shopping.items.find((row) => row.id === input.dataset.shoppingCheck); item.checked = input.checked; await repository.saveShopping(state.shopping); render(); }
    if (input.dataset.shoppingQuantity) { const item = state.shopping.items.find((row) => row.id === input.dataset.shoppingQuantity); item.quantity = input.value; await repository.saveShopping(state.shopping); }
    if (input.dataset.input === "import" && input.files[0]) { await restoreBackup(input.files[0]); await loadState(); notify("数据已恢复"); }
  } catch (error) { notify(error.message || "操作失败", "error"); }
});

app.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const form = event.target;
    if (form.dataset.form === "quick-entry") { const name = new FormData(form).get("name").trim(); appendToSlot(state.selectedSlot, { recipeId: null, name, source: "manual" }); await saveWeek("临时菜品已添加，可继续录入"); }
    if (form.dataset.form === "recipe") await saveRecipe(form);
    if (form.dataset.form === "manual-shopping") { const name = new FormData(form).get("name").trim(); state.shopping.items.push({ id: id("shopping"), name, category: "其他", checked: false, quantity: "", notes: "", recipeIds: [], manual: true }); await repository.saveShopping(state.shopping); notify("采购项已添加"); }
  } catch (error) { notify(error.message || "保存失败", "error"); }
});

app.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-recipe-id]");
  if (item) event.dataTransfer.setData("text/recipe-id", item.dataset.recipeId);
});
app.addEventListener("dragover", (event) => { if (event.target.closest("[data-slot]")) event.preventDefault(); });
app.addEventListener("drop", async (event) => {
  const slot = event.target.closest("[data-slot]");
  if (!slot) return;
  event.preventDefault();
  state.selectedSlot = slot.dataset.slot;
  await chooseRecipe(event.dataTransfer.getData("text/recipe-id"));
});

loadState().then(render).catch((error) => { app.innerHTML = `<div class="loading-screen">${error.message}</div>`; });
