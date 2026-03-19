import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  await fs.readFile(path.resolve(__dirname, "package.json"), "utf-8"),
);

function manifestPlugin() {
  return {
    name: "owlbear-manifest",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === "/manifest.json") {
          try {
            const manifestPath = path.resolve(
              __dirname,
              "public/manifest.json",
            );
            const manifestStr = await fs.readFile(manifestPath, "utf-8");
            const manifest = JSON.parse(manifestStr);

            manifest.version = `${pkg.version}-dev`;

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(manifest, null, 2));
            return;
          } catch (e) {
            next(e);
            return;
          }
        }
        next();
      });
    },

    async writeBundle(options: any) {
      const outDir = options.dir || "dist";
      const manifestPath = path.resolve(outDir, "manifest.json");
      try {
        const manifestStr = await fs.readFile(manifestPath, "utf-8");
        const manifest = JSON.parse(manifestStr);

        manifest.version = pkg.version;

        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      } catch (e) {
        console.error("Failed to update manifest.json in build", e);
      }
    },
  };
}

function dataIndexPlugin() {
  const dataDirPath = path.resolve(__dirname, "public/data");

  async function getJsonFiles() {
    try {
      const files = await fs.readdir(dataDirPath);
      return files.filter((f) => f.endsWith(".json"));
    } catch (e) {
      console.error("Failed to read data directory", e);
      return [];
    }
  }

  return {
    name: "owlbear-data-index",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === "/data/index.json") {
          const files = await getJsonFiles();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(files));
          return;
        }
        next();
      });
    },

    async writeBundle(options: any) {
      const outDir = options.dir || "dist";
      const indexPath = path.resolve(outDir, "data/index.json");
      const files = await getJsonFiles();
      try {
        await fs.mkdir(path.dirname(indexPath), { recursive: true });
        await fs.writeFile(indexPath, JSON.stringify(files));
      } catch (e) {
        console.error("Failed to write data index.json in build", e);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), manifestPlugin(), dataIndexPlugin()],
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
});
