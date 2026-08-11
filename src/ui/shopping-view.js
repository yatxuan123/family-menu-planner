import { escapeHtml } from "./week-view.js";

export function renderShoppingView(state) {
  const groups = Object.groupBy ? Object.groupBy(state.shopping.items, (item) => item.category) : state.shopping.items.reduce((acc, item) => ((acc[item.category] ||= []).push(item), acc), {});
  const checked = state.shopping.items.filter((item) => item.checked).length;
  return `<section class="view-shell"><header class="view-header"><div><span class="eyebrow">已购买 ${checked}/${state.shopping.items.length}</span><h1>采购清单</h1><p>从本周菜单汇总食材，数量可以手动补充。</p></div><div class="header-actions"><button class="button secondary" data-action="clear-checked">清理已购买</button><button class="button primary" data-action="refresh-shopping">从菜单更新</button></div></header>
    <form class="manual-shopping" data-form="manual-shopping"><label><span>临时采购项</span><input required name="name" placeholder="例如：厨房纸"></label><button class="button secondary" type="submit">添加</button></form>
    <div class="shopping-groups">${Object.entries(groups).map(([category, items]) => `<section class="shopping-group"><h2>${category}</h2>${items.map((item) => `<div class="shopping-row ${item.checked ? "checked" : ""}"><label class="shopping-check"><input type="checkbox" data-shopping-check="${item.id}" ${item.checked ? "checked" : ""}><span>${escapeHtml(item.name)}</span></label><input class="quantity-input" data-shopping-quantity="${item.id}" value="${escapeHtml(item.quantity)}" placeholder="数量/备注"><small>${item.recipeIds?.length ? `${item.recipeIds.length} 道菜需要` : "手动添加"}</small></div>`).join("")}</section>`).join("") || `<div class="empty-state"><h2>采购清单为空</h2><p>先安排本周菜单，再从菜单更新采购清单。</p></div>`}</div>
  </section>`;
}
