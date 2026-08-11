import { appendDish, getDishes, normalizeMealEntry } from "./meals.js";

const MEALS = ["breakfast", "lunch", "dinner"];
const DAYS = [0, 1, 2, 3, 4, 5, 6];
const TARGET_COUNTS = { breakfast: 2, lunch: 3, dinner: 3 };

function hash(value) {
  let result = 0;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

export function scoreRecipe(recipe, context) {
  let score = 100;
  if (!recipe.meals.includes(context.meal)) return -Infinity;
  if (context.recentIds.has(recipe.id)) score -= 70;
  if (context.todayRecipeIds.has(recipe.id)) score -= 100;
  score -= (context.weekRecipeCounts?.get(recipe.id) || 0) * 48;
  const ingredientNames = new Set(recipe.ingredients.map((item) => item.name));
  const overlapsToday = [...ingredientNames].filter((name) => context.todayIngredients.has(name)).length;
  score -= overlapsToday * 12;
  const reusedThisWeek = [...ingredientNames].filter((name) => context.weekIngredients.has(name)).length;
  score += reusedThisWeek * 4;
  if (context.meal === "breakfast" && ["早餐", "主食"].includes(recipe.category)) score += 18;
  if (context.meal !== "breakfast" && ["荤菜", "素菜", "主食", "汤"].includes(recipe.category)) score += 10;
  if (context.missingCategories?.has(recipe.category)) score += 24;
  score -= Math.max(0, recipe.minutes - 30) * 0.2;
  score += hash(`${context.seed}-${context.day}-${context.meal}-${recipe.id}`) % 11;
  return score;
}

export function planWeek({ recipes, history = [], existingEntries = {}, seed = "family-menu" }) {
  const entries = Object.fromEntries(Object.entries(existingEntries).map(([key, entry]) => [key, normalizeMealEntry(entry)]));
  const recentIds = new Set(history.flatMap((week) => Object.values(week.entries || {}).flatMap((entry) => getDishes(entry).map((dish) => dish.recipeId).filter(Boolean))));
  const weekIngredients = new Set();
  const weekRecipeCounts = new Map();

  Object.values(entries).forEach((entry) => {
    getDishes(entry).forEach((dish) => {
      const recipe = recipes.find((item) => item.id === dish.recipeId);
      if (recipe) {
        weekRecipeCounts.set(recipe.id, (weekRecipeCounts.get(recipe.id) || 0) + 1);
        recipe.ingredients.forEach((item) => weekIngredients.add(item.name));
      }
    });
  });

  for (const day of DAYS) {
    const todayRecipeIds = new Set();
    const todayIngredients = new Set();
    for (const meal of MEALS) {
      const key = `${day}-${meal}`;
      entries[key] = normalizeMealEntry(entries[key]);
      for (const dish of entries[key].dishes) {
        const existing = recipes.find((item) => item.id === dish.recipeId);
        if (existing) {
          todayRecipeIds.add(existing.id);
          existing.ingredients.forEach((item) => todayIngredients.add(item.name));
        }
      }
      while (entries[key].dishes.length < TARGET_COUNTS[meal]) {
        const currentCategories = new Set(entries[key].dishes.map((dish) => recipes.find((recipe) => recipe.id === dish.recipeId)?.category).filter(Boolean));
        const desired = meal === "breakfast" ? ["主食", "早餐"] : ["主食", "荤菜", "素菜", "汤"];
        const missingCategories = new Set(desired.filter((category) => !currentCategories.has(category)));
        const ranked = recipes
          .map((recipe) => ({ recipe, score: scoreRecipe(recipe, { meal, day, seed, recentIds, todayRecipeIds, todayIngredients, weekIngredients, weekRecipeCounts, missingCategories }) }))
          .filter((item) => Number.isFinite(item.score) && !entries[key].dishes.some((dish) => dish.recipeId === item.recipe.id))
          .sort((a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name, "zh-CN"));
        const selected = ranked[0]?.recipe;
        if (!selected) break;
        entries[key] = appendDish(entries[key], { recipeId: selected.id, name: selected.name, source: "auto" });
        weekRecipeCounts.set(selected.id, (weekRecipeCounts.get(selected.id) || 0) + 1);
        todayRecipeIds.add(selected.id);
        selected.ingredients.forEach((item) => {
          todayIngredients.add(item.name);
          weekIngredients.add(item.name);
        });
      }
    }
  }
  return entries;
}
