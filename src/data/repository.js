import { openDatabase, requestToPromise } from "./db.js";
import { SEED_RECIPES } from "./seed-recipes.js";

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${crypto.randomUUID()}`;

function weekStart(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(date);
}

export function getWeekId(date = new Date()) {
  return toLocalDateKey(weekStart(date));
}

export function createEmptyWeek(date = new Date()) {
  const start = weekStart(date);
  return {
    id: `week-${getWeekId(date)}`,
    startDate: toLocalDateKey(start),
    endDate: toLocalDateKey(new Date(start.getTime() + 6 * 86400000)),
    status: "current",
    entries: {},
    notes: {},
    createdAt: now(),
    updatedAt: now(),
  };
}

async function withStore(storeName, mode, callback) {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, mode);
  const store = transaction.objectStore(storeName);
  const done = new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("数据库事务失败"));
    transaction.onabort = () => reject(transaction.error || new Error("数据库事务已中止"));
  });
  const result = await callback(store);
  await done;
  db.close();
  return result;
}

async function getAll(storeName) {
  return withStore(storeName, "readonly", (store) => requestToPromise(store.getAll()));
}

async function getOne(storeName, key) {
  return withStore(storeName, "readonly", (store) => requestToPromise(store.get(key)));
}

async function put(storeName, value) {
  return withStore(storeName, "readwrite", (store) => requestToPromise(store.put(value)));
}

async function remove(storeName, key) {
  return withStore(storeName, "readwrite", (store) => requestToPromise(store.delete(key)));
}

export async function ensureInitialized() {
  const recipes = await getAll("recipes");
  if (!recipes.length) {
    for (const item of SEED_RECIPES) await put("recipes", item);
  }
  const currentId = `week-${getWeekId()}`;
  if (!(await getOne("weeks", currentId))) await put("weeks", createEmptyWeek());
  if (!(await getOne("shopping", currentId))) await put("shopping", { id: currentId, weekId: currentId, items: [], updatedAt: now() });
}

export const repository = {
  listRecipes: async (filters = {}) => {
    let items = await getAll("recipes");
    const query = (filters.query || "").trim().toLowerCase();
    if (query) items = items.filter((item) => `${item.name} ${item.ingredients.map((i) => i.name).join(" ")}`.toLowerCase().includes(query));
    if (filters.category && filters.category !== "全部") items = items.filter((item) => item.category === filters.category);
    if (filters.meal) items = items.filter((item) => item.meals.includes(filters.meal));
    return items.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  },
  saveRecipe: async (recipe) => put("recipes", { ...recipe, id: recipe.id || id("recipe"), updatedAt: now(), createdAt: recipe.createdAt || now() }),
  deleteRecipe: async (recipeId) => remove("recipes", recipeId),
  getRecipe: async (recipeId) => getOne("recipes", recipeId),
  getCurrentWeek: async () => getOne("weeks", `week-${getWeekId()}`),
  saveWeek: async (week) => put("weeks", { ...week, updatedAt: now() }),
  archiveWeek: async (week) => put("weeks", { ...week, status: "archived", updatedAt: now(), archivedAt: now() }),
  listArchivedWeeks: async () => (await getAll("weeks")).filter((week) => week.status === "archived").sort((a, b) => b.startDate.localeCompare(a.startDate)),
  getShopping: async (weekId) => getOne("shopping", weekId),
  saveShopping: async (list) => put("shopping", { ...list, updatedAt: now() }),
  exportAll: async () => ({ version: 1, exportedAt: now(), recipes: await getAll("recipes"), weeks: await getAll("weeks"), shopping: await getAll("shopping"), settings: await getAll("settings") }),
  replaceAll: async (snapshot) => {
    if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.recipes) || !Array.isArray(snapshot.weeks) || !Array.isArray(snapshot.shopping)) throw new Error("备份文件格式不受支持或已损坏。");
    for (const item of snapshot.recipes) await put("recipes", item);
    for (const item of snapshot.weeks) await put("weeks", item);
    for (const item of snapshot.shopping) await put("shopping", item);
    for (const item of snapshot.settings || []) await put("settings", item);
  },
};

export { id };
