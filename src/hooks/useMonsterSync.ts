import OBR from "@owlbear-rodeo/sdk";
import { useEffect } from "react";
import { ID } from "../constants.ts";
import { fetchBestiary } from "../utils/bestiary.ts";
import { resolveMonster } from "../utils/copy.ts";
import { getCustomMonster } from "../utils/idb.ts";
import { MonsterSchema } from "../utils/schema.ts";

export function useMonsterSync() {
  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      if (!OBR.isReady) return;

      const isGM = (await OBR.player.getRole()) === "GM";
      if (!isGM) return;

      const monsterData = await fetchBestiary();

      unsubscribe = OBR.scene.items.onChange(async (items) => {
        const characters = items.filter(
          (item) =>
            item.layer === "CHARACTER" &&
            item.metadata[`${ID}/monster`] === undefined,
        );

        if (characters.length === 0) return;

        const updates = new Map<string, any>();
        for (const item of characters) {
          let monster = await getCustomMonster(item.name.toLowerCase());
          if (monster) {
            try {
              monster = await resolveMonster(monster, async (n: string) => {
                let m = await getCustomMonster(n.toLowerCase());
                if (!m) {
                  m = monsterData.get(n.toLowerCase());
                }
                return m;
              });
            } catch (error) {
              console.error(error);
              continue;
            }
          } else {
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
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
}
