export const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
export const MEALS = [
  { id: "breakfast", label: "早餐" },
  { id: "lunch", label: "午餐" },
  { id: "dinner", label: "晚餐" },
];

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function mealCell(day, meal, entry, selected) {
  const dishes = getDishes(entry);
  return `<button class="meal-cell ${dishes.length ? "has-meal" : ""} ${selected ? "selected" : ""}" data-slot="${day}-${meal}" draggable="${Boolean(dishes.length)}">
    <span class="meal-dishes">${dishes.length ? dishes.map((dish) => `<span class="meal-name">${escapeHtml(dish.name)}</span>`).join("") : `<span class="meal-name">添加菜品</span>`}</span>
    <span class="meal-source">${dishes.length ? `${dishes.length} 道菜` : "+"}</span>
  </button>`;
}

export function renderWeekView(state) {
  const desktopRows = MEALS.map((meal) => `<div class="week-row-label">${meal.label}</div>${DAYS.map((_, day) => mealCell(day, meal.id, state.week.entries[`${day}-${meal.id}`], state.selectedSlot === `${day}-${meal.id}`)).join("")}`).join("");
  const day = state.selectedDay;
  const mobileMeals = MEALS.map((meal) => { const entry = state.week.entries[`${day}-${meal.id}`]; const names = getDishes(entry).map((dish) => dish.name).join("、"); return `<section class="mobile-meal-row"><div><span class="eyebrow">${meal.label}</span><strong>${escapeHtml(names || "尚未安排")}</strong></div>${mealCell(day, meal.id, entry, state.selectedSlot === `${day}-${meal.id}`)}</section>`; }).join("");
  return `<section class="view-shell week-view">
    <header class="view-header">
      <div><span class="eyebrow">当前计划</span><h1>本周菜单</h1><p>${state.week.startDate} 至 ${state.week.endDate}</p></div>
      <div class="header-actions"><button class="button ghost" data-action="clear-week">清空本周</button><button class="button secondary" data-action="archive-week">归档本周</button><button class="button primary" data-action="auto-plan">自动规划空餐</button></div>
    </header>
    <div class="week-layout ${state.selectedSlot ? "editor-open" : ""}">
      <div class="week-workspace">
        <div class="desktop-week-grid">
          <div class="week-corner">餐次</div>${DAYS.map((day) => `<div class="week-day-header">${day}</div>`).join("")}${desktopRows}
        </div>
        <div class="mobile-week">
          <div class="day-tabs" role="tablist">${DAYS.map((label, index) => `<button class="day-tab ${index === day ? "active" : ""}" data-day="${index}">${label.slice(1)}</button>`).join("")}</div>
          <div class="mobile-meals">${mobileMeals}</div>
        </div>
      </div>
      <aside id="editor-panel" class="editor-panel" aria-label="菜单编辑面板"></aside>
    </div>
  </section>`;
}
import { getDishes } from "../domain/meals.js";
