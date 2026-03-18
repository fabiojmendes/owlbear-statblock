import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import OBR from "@owlbear-rodeo/sdk";
import App from "./App.tsx";
import { fetchBestiary } from "./utils/bestiary.ts";

export const ID = "pro.juzam.statblock";

OBR.onReady(async () => {
  if ((await OBR.player.getRole()) !== "GM") {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(
        <StrictMode>
          <h1>StatBlock</h1>
          <p>Only GMs have access to stat blocks</p>
        </StrictMode>,
      );
    }
    return;
  }

  const monsterData = await fetchBestiary();

  OBR.scene.items.onChange((items) => {
    const characters = items.filter(
      (item) =>
        item.layer === "CHARACTER" &&
        item.metadata[`${ID}/monster`] === undefined,
    );

    OBR.scene.items.updateItems(characters, (items) => {
      for (const item of items) {
        const monster = monsterData.get(item.name.toLowerCase());
        if (monster) {
          item.metadata[`${ID}/monster`] = monster;
        }
      }
    });
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
