import OBR from "@owlbear-rodeo/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { fetchBestiary } from "./utils/bestiary.ts";

export const ID = "pro.juzam.statblock";

OBR.onReady(async () => {
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

  const isGM = (await OBR.player.getRole()) === "GM";

  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App isGM={isGM} />
      </StrictMode>,
    );
  }
});
