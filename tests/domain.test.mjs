import assert from "node:assert/strict";
import { planWeek } from "../src/domain/planner.js";
import { buildShoppingItems } from "../src/domain/shopping.js";
import { appendDish, normalizeMealEntry, removeDish } from "../src/domain/meals.js";

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

console.log("PASS 多菜餐次领域测试");
