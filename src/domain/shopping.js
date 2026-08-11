function normalize(name) {
  return name.trim().replace(/\s+/g, "").toLowerCase();
}

export function buildShoppingItems({ week, recipes, previous = [] }) {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const previousMap = new Map(previous.map((item) => [normalize(item.name), item]));
  const merged = new Map();

  Object.values(week.entries || {}).forEach((entry) => {
    getDishes(entry).forEach((dish) => {
      const recipe = recipeMap.get(dish.recipeId);
      if (!recipe) return;
      recipe.ingredients.forEach((ingredient) => {
      const key = normalize(ingredient.name);
      const current = merged.get(key) || {
        id: previousMap.get(key)?.id || `shopping-${key}`,
        name: ingredient.name,
        category: ingredient.category || "蔬菜及其他",
        checked: previousMap.get(key)?.checked || false,
        quantity: previousMap.get(key)?.quantity || "",
        notes: previousMap.get(key)?.notes || "",
        recipeIds: [],
        manual: false,
      };
      if (!current.recipeIds.includes(recipe.id)) current.recipeIds.push(recipe.id);
        merged.set(key, current);
      });
    });
  });
  previous.filter((item) => item.manual).forEach((item) => merged.set(`manual-${item.id}`, item));
  return [...merged.values()].sort((a, b) => a.category.localeCompare(b.category, "zh-CN") || a.name.localeCompare(b.name, "zh-CN"));
}
import { getDishes } from "./meals.js";
