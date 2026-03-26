import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  await fs.readFile(path.resolve(__dirname, "package.json"), "utf-8"),
);

function zipTokensPlugin() {
  return {
    name: "zip-tokens",
    async closeBundle() {
      const tokensDir = path.resolve(__dirname, "docs/tokens");
      const outDir = path.resolve(__dirname, "dist/data");
      const outZip = path.resolve(outDir, "token-pack.zip");

      await fs.mkdir(outDir, { recursive: true });
      try {
        await execAsync(
          `zip -q -j "${outZip}" "${tokensDir}"/*.webp "${tokensDir}/LICENSE-CC0.txt"`,
        );
        console.log(`Created ${outZip}`);
      } catch (err) {
        console.error("Failed to create token-pack.zip:", err);
      }
    },
  };
}

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
            manifest.name = `${manifest.name} (DEV)`;

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), manifestPlugin(), zipTokensPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        statblock: path.resolve(__dirname, "statblock.html"),
        packs: path.resolve(__dirname, "packs.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("@mui") || id.includes("@emotion")) {
            return "mui";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
});
