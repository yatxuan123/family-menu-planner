import { defineConfig } from "vite";
import { readFile } from "node:fs/promises";

const dataRoute = "/data/family-menu-data.json";
const dataFile = new URL("./data/family-menu-data.json", import.meta.url);

function familyMenuDataServePlugin() {
  return {
    name: "family-menu-data-serve",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(dataRoute, async (_request, response) => {
        try {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(await readFile(dataFile, "utf8"));
        } catch (error) {
          response.statusCode = 500;
          response.end(JSON.stringify({ message: `读取菜单数据失败：${error.message}` }));
        }
      });
    },
  };
}

function familyMenuDataBuildPlugin() {
  return {
    name: "family-menu-data-build",
    apply: "build",
    async buildStart() {
      this.emitFile({ type: "asset", fileName: "data/family-menu-data.json", source: await readFile(dataFile) });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [familyMenuDataServePlugin(), familyMenuDataBuildPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
