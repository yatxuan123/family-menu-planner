import { DAYS, MEALS, escapeHtml } from "./week-view.js";
import { getDishes } from "../domain/meals.js";

export function renderEditorPanel(state) {
  if (!state.selectedSlot) return `<div class="editor-empty"><span class="editor-empty-mark">＋</span><p>选择一个餐格，在这里添加或更换菜单。</p></div>`;
  const [day, meal] = state.selectedSlot.split("-");
  const mealLabel = MEALS.find((item) => item.id === meal)?.label;
  const entry = state.week.entries[state.selectedSlot];
  const dishes = getDishes(entry);
  const selectedRecipeIds = new Set(dishes.map((dish) => dish.recipeId).filter(Boolean));
  const query = state.recipeQuery.toLowerCase();
  const matches = state.recipes.filter((recipe) => !selectedRecipeIds.has(recipe.id) && recipe.meals.includes(meal) && (`${recipe.name} ${recipe.ingredients.map((i) => i.name).join(" ")}`).toLowerCase().includes(query));
  return `<div class="editor-content">
    <div class="editor-heading"><div><span class="eyebrow">${DAYS[Number(day)]} · ${mealLabel}</span><h2>添加菜品</h2></div><button class="icon-button" data-action="close-editor" aria-label="关闭编辑面板">×</button></div>
    ${dishes.length ? `<div class="current-dishes"><span class="eyebrow">本餐已选 ${dishes.length} 道</span>${dishes.map((dish, index) => `<div class="current-dish"><strong>${escapeHtml(dish.name)}</strong><button class="icon-button" data-remove-dish="${index}" aria-label="删除${escapeHtml(dish.name)}">×</button></div>`).join("")}</div>` : ""}
    <label class="search-field"><span>搜索菜谱或食材</span><input type="search" value="${escapeHtml(state.recipeQuery)}" data-input="recipe-query" placeholder="例如：番茄、面条"></label>
    <form class="quick-entry" data-form="quick-entry"><label><span>直接录入</span><input name="name" required placeholder="输入菜名"></label><button class="button secondary" type="submit">添加</button></form>
    <div class="editor-recipe-list">${matches.map((recipe) => `<button class="editor-recipe" data-select-recipe="${recipe.id}" draggable="true" data-recipe-id="${recipe.id}"><span><strong>${escapeHtml(recipe.name)}</strong><small>${recipe.category} · ${recipe.minutes} 分钟</small></span><span>选择</span></button>`).join("") || `<p class="empty-text">没有匹配菜谱，可直接录入或前往菜谱库新建。</p>`}</div>
    <div class="editor-footer">${dishes.length ? `<button class="button danger-text" data-action="clear-slot">清空此餐</button>` : ""}<button class="button ghost" data-action="go-recipes">管理菜谱</button></div>
  </div>`;
}
