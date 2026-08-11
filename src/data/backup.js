import { repository } from "./repository.js";

export async function downloadBackup() {
  const snapshot = await repository.exportAll();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `家庭菜单备份-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file) {
  const text = await file.text();
  let snapshot;
  try { snapshot = JSON.parse(text); } catch { throw new Error("备份文件不是有效 JSON。"); }
  await repository.replaceAll(snapshot);
}
