export function normalizeMealEntry(entry) {
  if (!entry) return { dishes: [] };
  if (Array.isArray(entry.dishes)) {
    return { ...entry, dishes: entry.dishes.filter((dish) => dish?.name || dish?.recipeId).map((dish) => ({ ...dish })) };
  }
  if (entry.name || entry.recipeId) {
    return { dishes: [{ recipeId: entry.recipeId || null, name: entry.name || "未命名菜品", source: entry.source || "legacy" }] };
  }
  return { dishes: [] };
}

export function appendDish(entry, dish) {
  const normalized = normalizeMealEntry(entry);
  const duplicate = dish.recipeId && normalized.dishes.some((item) => item.recipeId === dish.recipeId);
  if (duplicate) return normalized;
  return { ...normalized, dishes: [...normalized.dishes, { ...dish }] };
}

export function removeDish(entry, index) {
  const normalized = normalizeMealEntry(entry);
  return { ...normalized, dishes: normalized.dishes.filter((_, dishIndex) => dishIndex !== index) };
}

export function normalizeWeek(week) {
  return {
    ...week,
    entries: Object.fromEntries(Object.entries(week?.entries || {}).map(([key, entry]) => [key, normalizeMealEntry(entry)])),
  };
}

export function getDishes(entry) {
  return normalizeMealEntry(entry).dishes;
}
