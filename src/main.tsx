import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import OBR from "@owlbear-rodeo/sdk";
import App from "./App.tsx";

export const ID = "pro.juzam.statblock";

const DATA_DIR = "/data/";
const INDEX_FILE = "index.json";
let monsterData: Map<string, object>;

async function fetchBestiary() {
  try {
    const indexResponse = await fetch(`${DATA_DIR}${INDEX_FILE}`);
    if (!indexResponse.ok) {
      throw new Error(`Failed to load index from ${DATA_DIR}${INDEX_FILE}`);
    }
    const indexData: string[] = await indexResponse.json();

    const fetchPromises = indexData.map(async (fileName) => {
      try {
        const response = await fetch(`${DATA_DIR}${fileName}`);
        if (!response.ok) {
          console.warn(`Failed to fetch ${fileName}`);
          return [];
        }
        const data = await response.json();
        return data.monster || [];
      } catch (error) {
        console.error(`Error loading ${fileName}:`, error);
        return [];
      }
    });

    const results = (await Promise.all(fetchPromises)).flat();
    monsterData = results.reduce((accumulator, value) => {
      accumulator.set(value.name.toLowerCase(), value);
      return accumulator;
    }, new Map());

    console.log(
      "Bestiary loaded:",
      monsterData.size,
      "monsters from",
      indexData.length,
      "files",
    );
    return true;
  } catch (error) {
    console.error("Failed to fetch bestiary:", error);
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `<p class="error">Failed to load bestiary data. Please ensure public/data/index.json is correct.</p>`;
    }
    return false;
  }
}

function findMonster(name: string) {
  return monsterData.get(name.toLowerCase());
}

await fetchBestiary();

OBR.onReady(() => {
  OBR.scene.items.onChange((items) => {
    for (const item of items) {
      if (item.layer !== "CHARACTER" || item.metadata[`${ID}/monster`]) {
        continue;
      }

      console.log("Init item", item);

      const monster = findMonster(item.name);
      if (!monster) {
        continue;
      }
      console.log("Init monster", monster);

      OBR.scene.items.updateItems([item], (items) => {
        for (const item of items) {
          item.metadata[`${ID}/monster`] = monster;
        }
      });
    }
  });

  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
});
