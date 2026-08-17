export const LOCAL_STORAGE_KEY = "family-menu-data-v1";

export function createEmptySnapshot() {
  return { version: 1, recipes: [], weeks: [], shopping: [], settings: [] };
}

export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || snapshot.version !== 1) {
    throw new Error("菜单数据版本不受支持或内容已损坏。");
  }
  for (const collection of ["recipes", "weeks", "shopping", "settings"]) {
    if (!Array.isArray(snapshot[collection])) {
      throw new Error(`菜单数据缺少有效的 ${collection} 集合。`);
    }
  }
  snapshot.recipes.forEach((recipe, index) => {
    if (!recipe || typeof recipe.id !== "string" || typeof recipe.name !== "string") {
      throw new Error(`菜单数据 recipes[${index}] 缺少有效的 id 或 name。`);
    }
    if (!Array.isArray(recipe.ingredients)) throw new Error(`菜单数据 recipes[${index}] 缺少有效的 ingredients。`);
    if (!Array.isArray(recipe.meals)) throw new Error(`菜单数据 recipes[${index}] 缺少有效的 meals。`);
    recipe.ingredients.forEach((ingredient, ingredientIndex) => {
      if (!ingredient || typeof ingredient.name !== "string") {
        throw new Error(`菜单数据 recipes[${index}].ingredients[${ingredientIndex}] 缺少有效的 name。`);
      }
    });
    if (recipe.meals.some((meal) => typeof meal !== "string")) throw new Error(`菜单数据 recipes[${index}] 包含无效的 meals。`);
  });
  snapshot.weeks.forEach((week, index) => {
    if (!week || typeof week.id !== "string" || !week.entries || typeof week.entries !== "object" || Array.isArray(week.entries)) {
      throw new Error(`菜单数据 weeks[${index}] 缺少有效的 id 或 entries。`);
    }
    Object.entries(week.entries).forEach(([slot, entry]) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error(`菜单数据 weeks[${index}].entries.${slot} 不是有效餐次。`);
      }
      const dishes = Array.isArray(entry.dishes) ? entry.dishes : [entry];
      dishes.forEach((dish, dishIndex) => {
        if (!dish || typeof dish.name !== "string") {
          throw new Error(`菜单数据 weeks[${index}].entries.${slot}.dishes[${dishIndex}] 缺少有效的 name。`);
        }
      });
    });
  });
  snapshot.shopping.forEach((list, index) => {
    if (!list || typeof list.id !== "string" || !Array.isArray(list.items)) {
      throw new Error(`菜单数据 shopping[${index}] 缺少有效的 id 或 items。`);
    }
    list.items.forEach((item, itemIndex) => {
      if (!item || typeof item.id !== "string" || typeof item.name !== "string") {
        throw new Error(`菜单数据 shopping[${index}].items[${itemIndex}] 缺少有效的 id 或 name。`);
      }
      if (item.category !== undefined && typeof item.category !== "string") {
        throw new Error(`菜单数据 shopping[${index}].items[${itemIndex}] 包含无效的 category。`);
      }
    });
  });
  snapshot.settings.forEach((setting, index) => {
    if (!setting || typeof setting.id !== "string") throw new Error(`菜单数据 settings[${index}] 缺少有效的 id。`);
  });
  return snapshot;
}

export function shouldApplyBundledSnapshot(localSnapshot, bundledSnapshot) {
  validateSnapshot(localSnapshot);
  validateSnapshot(bundledSnapshot);
  const localHasData = ["recipes", "weeks", "shopping", "settings"].some((key) => localSnapshot[key].length > 0);
  const bundledHasData = ["recipes", "weeks", "shopping", "settings"].some((key) => bundledSnapshot[key].length > 0);
  return bundledHasData || !localHasData;
}

function defaultStorage() {
  if (!globalThis.localStorage) {
    throw new Error("当前浏览器不支持 localStorage，无法保存菜单数据。");
  }
  return globalThis.localStorage;
}

export function loadLocalSnapshot(storage = defaultStorage()) {
  const text = storage.getItem(LOCAL_STORAGE_KEY);
  if (!text) return createEmptySnapshot();
  let snapshot;
  try {
    snapshot = JSON.parse(text);
  } catch (error) {
    throw new Error(`本地菜单数据不是有效 JSON：${error.message}`);
  }
  return validateSnapshot(snapshot);
}

export function saveLocalSnapshot(snapshot, storage = defaultStorage()) {
  validateSnapshot(snapshot);
  try {
    storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    throw new Error(`保存本地菜单数据失败：${error.message}`);
  }
  return snapshot;
}
