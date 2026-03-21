import OBR from "@owlbear-rodeo/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ID } from "./constants.ts";
import "./index.css";
import { fetchBestiary } from "./utils/bestiary.ts";
import { getCustomMonster } from "./utils/idb.ts";
import { MonsterSchema } from "./utils/schema.ts";

OBR.onReady(async () => {
  const isGM = (await OBR.player.getRole()) === "GM";

  if (isGM) {
    // Load bestiary and populate tokens on update
    const monsterData = await fetchBestiary();

    OBR.scene.items.onChange(async (items) => {
      const characters = items.filter(
        (item) =>
          item.layer === "CHARACTER" &&
          item.metadata[`${ID}/monster`] === undefined,
      );

      if (characters.length === 0) return;

      const updates = new Map<string, any>();
      for (const item of characters) {
        let monster = await getCustomMonster(item.name.toLowerCase());
        if (!monster) {
          monster = monsterData.get(item.name.toLowerCase());
        }
        if (monster) {
          try {
            updates.set(item.id, MonsterSchema.parse(monster));
          } catch (e) {
            console.error(`Failed to parse monster for ${item.name}:`, e);
          }
        }
      }

      if (updates.size > 0) {
        OBR.scene.items.updateItems(characters, (itemsToUpdate) => {
          for (const item of itemsToUpdate) {
            const monster = updates.get(item.id);
            if (monster) {
              item.metadata[`${ID}/monster`] = monster;
            }
          }
        });
      }
    });
  }

  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App isGM={isGM} />
      </StrictMode>,
    );
  }
});
