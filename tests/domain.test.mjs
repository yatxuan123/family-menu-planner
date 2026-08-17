import assert from "node:assert/strict";
import { planWeek } from "../src/domain/planner.js";
import { buildShoppingItems } from "../src/domain/shopping.js";
import { appendDish, normalizeMealEntry, removeDish } from "../src/domain/meals.js";
import * as seedData from "../src/data/seed-recipes.js";

const recipes = [
  { id: "b1", name: "粥", category: "主食", meals: ["breakfast"], minutes: 10, ingredients: [{ name: "米", category: "主食" }] },
  { id: "b2", name: "鸡蛋", category: "早餐", meals: ["breakfast"], minutes: 8, ingredients: [{ name: "鸡蛋", category: "肉蛋" }] },
  { id: "l1", name: "肉丝", category: "荤菜", meals: ["lunch", "dinner"], minutes: 20, ingredients: [{ name: "猪肉", category: "肉蛋" }] },
  { id: "l2", name: "青菜", category: "素菜", meals: ["lunch", "dinner"], minutes: 10, ingredients: [{ name: "青菜", category: "蔬菜及其他" }] },
  { id: "l3", name: "米饭", category: "主食", meals: ["lunch", "dinner"], minutes: 30, ingredients: [{ name: "大米", category: "主食" }] },
];

const legacy = normalizeMealEntry({ recipeId: "l1", name: "肉丝", source: "library" });
assert.equal(legacy.dishes.length, 1, "旧单菜餐格应转为一项 dishes 数组");

const twoDishes = appendDish(appendDish(null, { recipeId: "l1", name: "肉丝" }), { recipeId: "l2", name: "青菜" });
assert.equal(twoDishes.dishes.length, 2, "同一餐应能追加两道菜");
assert.deepEqual(removeDish(twoDishes, 0).dishes.map((dish) => dish.recipeId), ["l2"], "应只删除指定菜品");
const recipeIdsWithoutLimit = Array.from({ length: 12 }, (_, index) => `dish-${index + 1}`);
const manyDishes = recipeIdsWithoutLimit.reduce((entry, recipeId) => appendDish(entry, { recipeId, name: recipeId }), null);
assert.equal(manyDishes.dishes.length, 12, "不同菜品不应有数量上限");
assert.equal(appendDish(manyDishes, { recipeId: "dish-1", name: "重复菜品" }).dishes.length, 12, "同一道菜不应重复添加");

const planned = planWeek({ recipes, seed: "multi" });
assert.equal(planned["0-breakfast"].dishes.length, 2, "早餐应补齐两道菜");
assert.equal(planned["0-lunch"].dishes.length, 3, "午餐应补齐三道菜");
assert.equal(planned["0-dinner"].dishes.length, 3, "晚餐应补齐三道菜");

const shopping = buildShoppingItems({ week: { entries: { a: twoDishes } }, recipes });
assert.deepEqual(new Set(shopping.map((item) => item.name)), new Set(["猪肉", "青菜"]), "采购清单应汇总同餐全部菜品");

const requestedRecipeNames = [
  "鱿鱼", "清蒸鱼", "红烧鱼", "剁椒鱼头", "香煎带鱼", "芹菜酸萝卜炒毛肚",
  "红烧冬瓜", "老南瓜", "嫩南瓜", "煎豆腐", "芹菜香干", "紫苏黄瓜", "煎辣椒", "手撕包菜",
  "醋蒸鸡", "盐焗鸡", "小炒鸡", "鸡汤", "蛋",
  "口蘑西蓝花", "花菜", "清炒西蓝花", "黄瓜火腿肠", "紫苏煎黄瓜",
  "擂辣椒豆角", "土豆丝", "擂辣椒土豆片", "茄子肉沫", "油豆腐肉沫",
  "姜辣鸡爪", "虎皮凤爪", "鸡翅",
  "紫苏油爆虾", "白灼虾", "小龙虾", "罗氏虾",
  "辣椒炒肉", "蒜苗炒肉", "茭白炒肉", "胡萝卜炒肉", "泡椒牛肉",
  "土豆排骨", "红烧排骨", "红烧猪蹄", "红烧牛排骨",
];
const seedNames = seedData.SEED_RECIPES.map((recipe) => recipe.name);
assert.deepEqual(requestedRecipeNames.filter((name) => !seedNames.includes(name)), [], "用户提供的菜谱应全部加入内置菜谱");
assert.equal(new Set(seedNames).size, seedNames.length, "内置菜谱名称不应重复");
assert.equal(seedNames.filter((name) => name === "清蒸鱼").length, 1, "已有清蒸鱼不应重复添加");
for (const name of requestedRecipeNames) {
  const recipe = seedData.SEED_RECIPES.find((item) => item.name === name);
  assert.deepEqual(recipe?.meals, ["lunch", "dinner"], `${name}应适用于午餐和晚餐`);
}
assert.equal(typeof seedData.getMissingSeedRecipes, "function", "应提供只补充缺失内置菜谱的迁移函数");
if (seedData.getMissingSeedRecipes) {
  const missing = seedData.getMissingSeedRecipes([{ id: "custom-fish", name: "清蒸鱼" }]);
  assert.equal(missing.some((item) => item.name === "清蒸鱼"), false, "同名已有菜谱不应被迁移重复添加");
  assert.equal(missing.some((item) => item.name === "鱿鱼"), true, "缺失的内置菜谱应被迁移添加");
}

console.log("PASS 多菜餐次领域测试");
