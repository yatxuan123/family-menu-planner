import { validateSnapshot } from "./storage.js";

export const BUNDLED_DATA_URL = "./data/family-menu-data.json";
export const DEFAULT_REMOTE_URL = "https://raw.githubusercontent.com/yatxuan123/family-menu-planner/main/data/family-menu-data.json";
export const GITHUB_API_URL = "https://api.github.com/repos/yatxuan123/family-menu-planner/contents/data/family-menu-data.json";

export class RemoteConflictError extends Error {
  constructor() {
    super("远程数据已变化，请先读取 GitHub 后再保存。");
    this.name = "RemoteConflictError";
  }
}

async function responseMessage(response) {
  try {
    const body = await response.json();
    return body.message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

async function readSnapshotText(url, label, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(url, { cache: "no-store" });
  } catch (error) {
    throw new Error(`${label}失败：${error.message}`);
  }
  if (!response.ok) throw new Error(`${label}失败：${await responseMessage(response)}`);
  let text;
  try {
    text = await response.text();
  } catch (error) {
    throw new Error(`${label}返回内容读取失败：${error.message}`);
  }
  let snapshot;
  try {
    snapshot = JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}返回的内容不是有效 JSON：${error.message}`);
  }
  return { snapshot: validateSnapshot(snapshot), text };
}

export async function loadBundledSnapshot(fetchImpl = fetch) {
  return (await readSnapshotText(BUNDLED_DATA_URL, "读取同项目菜单数据", fetchImpl)).snapshot;
}

function githubHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readGithubMetadata(token, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(GITHUB_API_URL, { headers: githubHeaders(token), cache: "no-store" });
  } catch (error) {
    throw new Error(`读取 GitHub 文件 SHA 失败：${error.message}`);
  }
  if (!response.ok) throw new Error(`读取 GitHub 文件 SHA 失败：${await responseMessage(response)}`);
  let metadata;
  try {
    metadata = await response.json();
  } catch (error) {
    throw new Error(`GitHub SHA 响应不是有效 JSON：${error.message}`);
  }
  if (!metadata?.sha) throw new Error("GitHub 文件响应缺少 SHA，无法进行并发保护保存。");
  return metadata;
}

export async function loadRemoteSnapshot(fetchImpl = fetch) {
  const { snapshot, text } = await readSnapshotText(DEFAULT_REMOTE_URL, "读取 GitHub 菜单数据", fetchImpl);
  return { snapshot, sha: await computeGitBlobSha(text) };
}

export async function computeGitBlobSha(text) {
  const content = new TextEncoder().encode(text);
  const header = new TextEncoder().encode(`blob ${content.byteLength}\0`);
  const gitObject = new Uint8Array(header.byteLength + content.byteLength);
  gitObject.set(header);
  gitObject.set(content, header.byteLength);
  const digest = await crypto.subtle.digest("SHA-1", gitObject);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunkSize = 8192;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export async function saveRemoteSnapshot(snapshot, token, expectedSha, fetchImpl = fetch) {
  validateSnapshot(snapshot);
  if (!token?.trim()) throw new Error("请输入拥有 Contents: Read and write 权限的 GitHub Token。");
  if (!expectedSha) throw new Error("首次保存前请先读取 GitHub，以建立并发保护基准。");

  const headers = githubHeaders(token.trim());
  const metadata = await readGithubMetadata(token.trim(), fetchImpl);
  if (metadata.sha !== expectedSha) throw new RemoteConflictError();

  const body = {
    message: "chore: 更新家庭菜单数据",
    content: encodeBase64(`${JSON.stringify(snapshot, null, 2)}\n`),
    sha: expectedSha,
    branch: "main",
  };

  let saveResponse;
  try {
    saveResponse = await fetchImpl(GITHUB_API_URL, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(`保存 GitHub 菜单数据失败：${error.message}`);
  }
  if (saveResponse.status === 409) throw new RemoteConflictError();
  if (!saveResponse.ok) throw new Error(`保存 GitHub 菜单数据失败：${await responseMessage(saveResponse)}`);
  let result;
  try {
    result = await saveResponse.json();
  } catch (error) {
    throw new Error(`GitHub 保存响应不是有效 JSON：${error.message}`);
  }
  return { commitSha: result.commit?.sha, fileSha: result.content?.sha };
}
