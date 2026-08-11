import { MEALS, escapeHtml } from "./week-view.js";
import { getDishes } from "../domain/meals.js";

export function renderTodayView(state) {
  const jsDay = new Date().getDay() || 7;
  const day = jsDay - 1;
  return `<section class="view-shell"><header class="view-header"><div><span class="eyebrow">今天 · 周${"一二三四五六日"[day]}</span><h1>今日菜单</h1><p>从本周计划自动同步</p></div></header>
    <div class="today-list">${MEALS.map((meal) => { const entry = state.week.entries[`${day}-${meal.id}`]; const dishes = getDishes(entry); const recipes = dishes.map((dish) => state.recipes.find((item) => item.id === dish.recipeId)).filter(Boolean); return `<article class="today-item"><div><span class="meal-badge">${meal.label}</span><h2>${escapeHtml(dishes.map((dish) => dish.name).join("、") || "尚未安排")}</h2><p>${recipes.length ? recipes.map((recipe) => `${recipe.category} · ${recipe.minutes} 分钟 · ${recipe.ingredients.map((i) => i.name).join("、")}`).join("；") : "可前往本周菜单添加"}</p></div><button class="button secondary" data-open-slot="${day}-${meal.id}">${dishes.length ? "添加/调整" : "安排"}</button></article>`; }).join("")}</div>
  </section>`;
}
