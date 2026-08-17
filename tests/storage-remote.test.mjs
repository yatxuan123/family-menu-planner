import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  LOCAL_STORAGE_KEY,
  createEmptySnapshot,
  loadLocalSnapshot,
  saveLocalSnapshot,
  shouldApplyBundledSnapshot,
  validateSnapshot,
} from "../src/data/storage.js";
import {
  GITHUB_API_URL,
  RemoteConflictError,
  loadRemoteSnapshot,
  saveRemoteSnapshot,
} from "../src/data/remote.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

const empty = createEmptySnapshot();
assert.deepEqual(empty, { version: 1, recipes: [], weeks: [], shopping: [], settings: [] }, "空快照应包含全部数据集合");
const recipeRecord = (id, name) => ({ id, name, ingredients: [], meals: ["lunch", "dinner"] });

const local = memoryStorage();
assert.deepEqual(loadLocalSnapshot(local), empty, "没有缓存时应返回空快照");
const saved = { ...empty, recipes: [recipeRecord("r1", "清蒸鱼")] };
saveLocalSnapshot(saved, local);
assert.deepEqual(JSON.parse(local.getItem(LOCAL_STORAGE_KEY)), saved, "保存应立即写入固定 localStorage Key");
assert.deepEqual(loadLocalSnapshot(local), saved, "应能重新读取已保存快照");
assert.throws(
  () => loadLocalSnapshot(memoryStorage({ [LOCAL_STORAGE_KEY]: "not-json" })),
  /本地菜单数据不是有效 JSON/,
  "损坏的本地 JSON 应返回明确错误",
);
assert.throws(() => validateSnapshot({ version: 1, recipes: [] }), /缺少有效的 weeks/, "不完整快照不应覆盖现有数据");
assert.throws(
  () => validateSnapshot({ ...empty, recipes: [{ id: "broken", name: "坏数据" }] }),
  /recipes\[0\].*ingredients/,
  "缺少关键字段的菜谱不应写入本地缓存",
);
assert.throws(
  () => validateSnapshot({ ...empty, recipes: [{ ...recipeRecord("broken-ingredient", "坏食材"), ingredients: [null] }] }),
  /ingredients\[0\].*name/,
  "无效食材元素不应写入本地缓存",
);
assert.throws(
  () => validateSnapshot({ ...empty, weeks: [{ id: "week-broken", entries: { "0-lunch": { dishes: [null] } } }] }),
  /dishes\[0\].*name/,
  "无效餐次菜品不应写入本地缓存",
);
assert.throws(
  () => validateSnapshot({ ...empty, shopping: [{ id: "shopping-broken", items: [null] }] }),
  /items\[0\].*id/,
  "无效采购项不应写入本地缓存",
);
assert.equal(shouldApplyBundledSnapshot(saved, empty), false, "空初始快照不应覆盖已有本地数据");
assert.equal(shouldApplyBundledSnapshot(empty, saved), true, "包含数据的同站点快照应覆盖本地缓存");
assert.equal(shouldApplyBundledSnapshot(empty, empty), true, "首次启动时允许应用空初始快照");

const remoteSnapshot = { ...empty, recipes: [recipeRecord("r2", "红烧鱼")] };
const readCalls = [];
const loadedRemote = await loadRemoteSnapshot(async (url) => {
  readCalls.push(url);
  if (url === GITHUB_API_URL) return { ok: true, json: async () => ({ sha: "read-sha" }) };
  return { ok: true, json: async () => remoteSnapshot };
});
assert.deepEqual(loadedRemote, { snapshot: remoteSnapshot, sha: "read-sha" }, "读取 GitHub 应同时返回完整快照和基准 SHA");
assert.equal(readCalls.length, 3, "读取时应在 raw 文件前后各校验一次 SHA");
assert.match(readCalls[1], /raw\.githubusercontent\.com\/yatxuan123\/family-menu-planner\/main\/data\/family-menu-data\.json/, "应读取已确认的公开 raw 文件");

let raceMetadataReads = 0;
await assert.rejects(
  () => loadRemoteSnapshot(async (url) => {
    if (url !== GITHUB_API_URL) return { ok: true, json: async () => remoteSnapshot };
    raceMetadataReads += 1;
    return { ok: true, json: async () => ({ sha: raceMetadataReads === 1 ? "before-sha" : "after-sha" }) };
  }),
  RemoteConflictError,
  "raw 读取期间远程 SHA 变化时不应接受不一致快照",
);

const apiCalls = [];
const unicodeSnapshot = { ...empty, recipes: [recipeRecord("r3", "芹菜香干")] };
const savedResult = await saveRemoteSnapshot(unicodeSnapshot, "github-token", "old-sha", async (url, options = {}) => {
  apiCalls.push({ url, options });
  if (!options.method) return { ok: true, json: async () => ({ sha: "old-sha" }) };
  return { ok: true, json: async () => ({ commit: { sha: "commit-sha" }, content: { sha: "new-sha" } }) };
});
assert.equal(apiCalls.length, 2, "保存前应读取 SHA，再执行 PUT");
assert.equal(apiCalls[0].url, GITHUB_API_URL, "SHA 和保存应使用 Contents API 地址");
assert.equal(apiCalls[1].options.method, "PUT", "保存应使用 PUT");
assert.equal(apiCalls[1].options.headers.Authorization, "Bearer github-token", "请求应携带 Fine-grained Token");
const putBody = JSON.parse(apiCalls[1].options.body);
assert.equal(putBody.sha, "old-sha", "PUT 应携带读取到的 SHA 防止覆盖并发更新");
assert.equal(Buffer.from(putBody.content, "base64").toString("utf8"), `${JSON.stringify(unicodeSnapshot, null, 2)}\n`, "中文快照应正确编码为 UTF-8 Base64");
assert.equal(savedResult.commitSha, "commit-sha", "应返回 GitHub 生成的提交 SHA");

await assert.rejects(() => saveRemoteSnapshot(empty, "github-token", "", async () => ({ ok: true })), /先读取 GitHub/, "没有基准 SHA 时应拒绝保存");

let stalePutCalled = false;
await assert.rejects(
  () => saveRemoteSnapshot(empty, "github-token", "old-sha", async (_url, options = {}) => {
    if (!options.method) return { ok: true, json: async () => ({ sha: "newer-sha" }) };
    stalePutCalled = true;
    return { ok: true, json: async () => ({}) };
  }),
  RemoteConflictError,
  "远程 SHA 与上次读取不一致时应拒绝覆盖",
);
assert.equal(stalePutCalled, false, "检测到旧基准 SHA 后不应发起 PUT");

await assert.rejects(
  () => saveRemoteSnapshot(empty, "github-token", "same-sha", async (_url, options = {}) => {
    if (!options.method) return { ok: true, json: async () => ({ sha: "same-sha" }) };
    return { ok: false, status: 409, json: async () => ({ message: "Conflict" }) };
  }),
  RemoteConflictError,
  "GET 与 PUT 之间发生更新并返回 409 时也应抛出并发冲突错误",
);

const sourceSnapshot = JSON.parse(await readFile(new URL("../data/family-menu-data.json", import.meta.url), "utf8"));
assert.deepEqual(validateSnapshot(sourceSnapshot), sourceSnapshot, "仓库根目录应包含 GitHub API 与构建共用的数据源");
const viteConfig = await readFile(new URL("../vite.config.js", import.meta.url), "utf8");
assert.match(viteConfig, /name:\s*"family-menu-data-build"[\s\S]*?apply:\s*"build"/, "构建数据插件不应在开发服务中调用 emitFile");

console.log("PASS 本地存储与 GitHub 同步测试");
