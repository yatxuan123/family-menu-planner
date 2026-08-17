import { loadLocalSnapshot, saveLocalSnapshot, validateSnapshot } from "./storage.js";
import { getMissingSeedRecipes, SEED_DATA_VERSION } from "./seed-recipes.js";

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

function getAll(collection) {
  return loadLocalSnapshot()[collection];
}

function getOne(collection, key) {
  return getAll(collection).find((item) => item.id === key);
}

function put(collection, value) {
  const snapshot = loadLocalSnapshot();
  const items = snapshot[collection];
  const index = items.findIndex((item) => item.id === value.id);
  if (index === -1) items.push(value);
  else items[index] = value;
  saveLocalSnapshot(snapshot);
  return value;
}

function remove(collection, key) {
  const snapshot = loadLocalSnapshot();
  snapshot[collection] = snapshot[collection].filter((item) => item.id !== key);
  saveLocalSnapshot(snapshot);
}

export async function ensureInitialized() {
  const recipes = getAll("recipes");
  const seedVersion = getOne("settings", "seed-recipes-version");
  if (!seedVersion || seedVersion.version < SEED_DATA_VERSION) {
    for (const item of getMissingSeedRecipes(recipes)) put("recipes", item);
    put("settings", { id: "seed-recipes-version", version: SEED_DATA_VERSION, updatedAt: now() });
  }
  const currentId = `week-${getWeekId()}`;
  if (!getOne("weeks", currentId)) put("weeks", createEmptyWeek());
  if (!getOne("shopping", currentId)) put("shopping", { id: currentId, weekId: currentId, items: [], updatedAt: now() });
}

export const repository = {
  listRecipes: async (filters = {}) => {
    let items = getAll("recipes");
    const query = (filters.query || "").trim().toLowerCase();
    if (query) items = items.filter((item) => `${item.name} ${item.ingredients.map((ingredient) => ingredient.name).join(" ")}`.toLowerCase().includes(query));
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
  listArchivedWeeks: async () => getAll("weeks").filter((week) => week.status === "archived").sort((a, b) => b.startDate.localeCompare(a.startDate)),
  getShopping: async (weekId) => getOne("shopping", weekId),
  saveShopping: async (list) => put("shopping", { ...list, updatedAt: now() }),
  exportAll: async () => structuredClone(loadLocalSnapshot()),
  replaceAll: async (snapshot) => saveLocalSnapshot(structuredClone(validateSnapshot(snapshot))),
};

export { id };
