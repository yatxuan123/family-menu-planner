import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderEditorPanel } from "../src/ui/editor-panel.js";

const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

assert.match(styles, /\.editor-content\s*\{[^}]*overflow-y:\s*auto/s, "编辑内容必须可纵向滚动，避免菜品增多后添加入口被裁切");
assert.match(styles, /safe-area-inset-bottom/, "移动端底部导航和编辑器必须适配系统安全区");
assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.button[^}]*min-height:\s*44px/, "移动端主要按钮必须提供至少 44px 触控高度");
assert.match(styles, /body\s*\{[^}]*min-width:\s*0/s, "页面不得使用固定最小宽度造成 320px 设备横向滚动");

const editorHtml = renderEditorPanel({
  selectedSlot: "0-breakfast",
  recipeQuery: "",
  week: { entries: { "0-breakfast": { dishes: [{ recipeId: "selected", name: "已选鸡蛋饼" }] } } },
  recipes: [
    { id: "selected", name: "已选鸡蛋饼", meals: ["breakfast"], ingredients: [], category: "早餐", minutes: 15 },
    { id: "available", name: "可选小米粥", meals: ["breakfast"], ingredients: [], category: "主食", minutes: 30 },
  ],
});

assert.doesNotMatch(editorHtml, /data-select-recipe="selected"/, "当前餐次已选菜谱不应继续出现在候选列表");
assert.match(editorHtml, /data-select-recipe="available"/, "尚未选择的菜谱应继续出现在候选列表");

console.log("PASS 移动端布局回归测试");
