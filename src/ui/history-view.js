import { DAYS, MEALS, escapeHtml } from "./week-view.js";
import { getDishes } from "../domain/meals.js";

export function renderHistoryView(state) {
  return `<section class="view-shell"><header class="view-header"><div><span class="eyebrow">${state.history.length} 周记录</span><h1>历史菜单</h1><p>复制过去的安排，快速开始新一周。</p></div></header>
    <div class="history-list">${state.history.map((week) => `<article class="history-week"><div class="history-week-head"><div><span class="eyebrow">${week.startDate} 至 ${week.endDate}</span><h2>${Object.values(week.entries || {}).reduce((sum, entry) => sum + getDishes(entry).length, 0)} 道已安排菜品</h2></div><button class="button secondary" data-copy-week="${week.id}">复制整周</button></div><div class="history-days">${DAYS.map((day, dayIndex) => `<div class="history-day"><div><strong>${day}</strong><button class="text-button" data-copy-day="${week.id}:${dayIndex}">复制当天</button></div>${MEALS.map((meal) => { const entry = week.entries?.[`${dayIndex}-${meal.id}`]; const names = getDishes(entry).map((dish) => dish.name).join("、"); return `<button class="history-meal" ${entry ? `data-copy-meal="${week.id}:${dayIndex}:${meal.id}"` : "disabled"}><span>${meal.label}</span><strong>${escapeHtml(names || "未安排")}</strong></button>`; }).join("")}</div>`).join("")}</div></article>`).join("") || `<div class="empty-state"><h2>还没有历史菜单</h2><p>在本周菜单中点击“归档本周”，记录会出现在这里。</p></div>`}</div>
  </section>`;
}
