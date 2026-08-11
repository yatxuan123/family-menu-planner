import { escapeHtml } from "./week-view.js";

export function renderRecipesView(state) {
  const query = state.libraryQuery.toLowerCase();
  const recipes = state.recipes.filter((recipe) => {
    const matchesQuery = `${recipe.name} ${recipe.ingredients.map((i) => i.name).join(" ")}`.toLowerCase().includes(query);
    const matchesCategory = state.categoryFilter === "全部" || recipe.category === state.categoryFilter;
    return matchesQuery && matchesCategory;
  });
  const categories = ["全部", ...new Set(state.recipes.map((recipe) => recipe.category))];
  return `<section class="view-shell"><header class="view-header"><div><span class="eyebrow">${state.recipes.length} 道菜</span><h1>菜谱库</h1><p>搜索、维护并拖拽菜谱到本周菜单。</p></div><button class="button primary" data-action="new-recipe">新增菜谱</button></header>
    <div class="library-toolbar"><label class="search-field compact"><span>搜索</span><input type="search" data-input="library-query" value="${escapeHtml(state.libraryQuery)}" placeholder="搜索菜名或食材"></label><div class="filter-chips">${categories.map((category) => `<button class="filter-chip ${state.categoryFilter === category ? "active" : ""}" data-category="${category}">${category}</button>`).join("")}</div></div>
    <div class="recipe-grid">${recipes.map((recipe) => `<article class="recipe-card" draggable="true" data-recipe-id="${recipe.id}"><div class="recipe-card-head"><span class="category-dot ${categoryClass(recipe.category)}"></span><span>${recipe.category}</span><button class="icon-button" data-edit-recipe="${recipe.id}" aria-label="编辑${escapeHtml(recipe.name)}">⋯</button></div><h2>${escapeHtml(recipe.name)}</h2><p>${recipe.ingredients.map((item) => escapeHtml(item.name)).join(" · ")}</p><div class="recipe-meta"><span>${recipe.minutes} 分钟</span><span>${recipe.difficulty}</span></div></article>`).join("") || `<div class="empty-state"><h2>没有匹配菜谱</h2><p>调整筛选条件或新增一道菜。</p></div>`}</div>
    ${state.recipeFormOpen ? renderRecipeForm(state.editingRecipe) : ""}
  </section>`;
}

function categoryClass(category) {
  return { "荤菜": "red", "素菜": "green", "汤": "blue", "主食": "gold", "早餐": "purple" }[category] || "gray";
}

function renderRecipeForm(recipe) {
  const item = recipe || { name: "", category: "素菜", meals: ["lunch", "dinner"], ingredients: [], minutes: 20, difficulty: "简单", steps: "", notes: "" };
  return `<div class="modal-backdrop"><form class="modal recipe-form" data-form="recipe" data-recipe-id="${item.id || ""}"><div class="editor-heading"><div><span class="eyebrow">菜谱资料</span><h2>${item.id ? "编辑菜谱" : "新增菜谱"}</h2></div><button type="button" class="icon-button" data-action="close-recipe-form">×</button></div>
    <div class="form-grid"><label><span>菜名</span><input name="name" required value="${escapeHtml(item.name)}"></label><label><span>分类</span><select name="category">${["早餐", "主食", "荤菜", "素菜", "汤", "其他"].map((value) => `<option ${item.category === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label><span>耗时（分钟）</span><input name="minutes" type="number" min="1" value="${item.minutes}"></label><label><span>难度</span><select name="difficulty">${["简单", "中等", "复杂"].map((value) => `<option ${item.difficulty === value ? "selected" : ""}>${value}</option>`).join("")}</select></label></div>
    <fieldset><legend>适用餐次</legend>${[["breakfast", "早餐"], ["lunch", "午餐"], ["dinner", "晚餐"]].map(([value, label]) => `<label class="check-label"><input type="checkbox" name="meals" value="${value}" ${item.meals.includes(value) ? "checked" : ""}>${label}</label>`).join("")}</fieldset>
    <label><span>食材（用顿号、逗号或换行分隔）</span><textarea name="ingredients" rows="3">${escapeHtml(item.ingredients.map((i) => i.name).join("、"))}</textarea></label><label><span>做法</span><textarea name="steps" rows="4">${escapeHtml(item.steps)}</textarea></label><label><span>备注</span><textarea name="notes" rows="2">${escapeHtml(item.notes)}</textarea></label>
    <div class="modal-actions">${item.id ? `<button type="button" class="button danger-text" data-delete-recipe="${item.id}">删除</button>` : ""}<span></span><button type="button" class="button ghost" data-action="close-recipe-form">取消</button><button class="button primary" type="submit">保存菜谱</button></div></form></div>`;
}
