import { Button, Stack } from "@mui/material";
import OBR, { isImage } from "@owlbear-rodeo/sdk";
import { Dice } from "dice-typescript";
import { ID } from "../main.tsx";
import { getInitiativeBonus } from "../utils/helpers.ts";

const dice = new Dice();

function rollInitiative(monster: any) {
  const initBonus = getInitiativeBonus(monster);
  let baseDice: string;
  switch (monster.initiative?.advantageMode) {
    case "adv":
      baseDice = "2d20kh";
      break;
    case "dis":
      baseDice = "2d20kl";
      break;
    default:
      baseDice = "1d20";
  }
  const formula = `${baseDice}${initBonus >= 0 ? `+${initBonus}` : `${initBonus}`}`;
  return dice.roll(formula).total;
}

function Actions() {
  const showStatblock = () => {
    OBR.popover.open({
      id: `${ID}/statblock`,
      url: "/statblock",
      height: 550,
      width: 450,
      disableClickAway: true,
      anchorOrigin: { horizontal: "RIGHT", vertical: "TOP" },
      marginThreshold: 75,
    });
    OBR.action.close();
  };

  const startCombat = () => {
    OBR.scene.items.updateItems(
      (item) => {
        if (isImage(item)) {
          const monster: any = item.metadata[`${ID}/monster`];
          const battleBoard: any =
            item.metadata["com.missing-link-dev.battle-board/metadata"];
          return (
            item.layer === "CHARACTER" && monster && battleBoard?.inInitiative
          );
        } else {
          return false;
        }
      },
      (items) => {
        for (const item of items) {
          const monster: any = item.metadata[`${ID}/monster`];
          const battleBoard: any =
            item.metadata["com.missing-link-dev.battle-board/metadata"];

          battleBoard.initiative = rollInitiative(monster);

          if (monster?.hp?.formula) {
            const hp = dice.roll(monster.hp.formula).total;
            battleBoard.maxHP = hp;
            battleBoard.currentHP = hp;
          }
          battleBoard.ac = monster.ac[0].ac || monster.ac[0];
        }
        OBR.notification.show(
          `BattleBoard updated with ${items.length} items!`,
        );
      },
    );
    OBR.action.close();
  };

  return (
    <Stack spacing={2}>
      <Button variant="outlined" fullWidth onClick={showStatblock}>
        Show
      </Button>
      <Button variant="outlined" fullWidth onClick={startCombat}>
        Start Combat!
      </Button>
    </Stack>
  );
}

export default Actions;
