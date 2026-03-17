import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { ID } from "./main";

function StatBlock() {
  const [monster, setMonster] = useState({});

  useEffect(() => {
    OBR.player.onChange(async (player) => {
      if (player.selection && player.selection.length === 1) {
        const items = await OBR.scene.items.getItems(player.selection);
        const monster = items[0].metadata[`${ID}/monster`];
        if (monster) {
          setMonster(monster);
        }
      }
    });
  });
  return (
    <section>
      <div>
        <h1>Get started</h1>
        <code>{JSON.stringify(monster)}</code>
        <button
          type="button"
          onClick={() => OBR.popover.close(`${ID}/statblock`)}
        >
          close
        </button>
      </div>
    </section>
  );
}

export default StatBlock;
