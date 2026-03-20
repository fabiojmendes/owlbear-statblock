import PeopleIcon from "@mui/icons-material/People";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { Dice } from "dice-typescript";
import { useEffect } from "react";
import { useRollVisibility } from "../hooks/useRollVisibility.ts";
import { ID } from "../main.tsx";
import { fetchBestiary } from "../utils/bestiary.ts";
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

/**
 * Load bestiary and populate tokens on update
 */
async function backgroundTask() {
  console.log("Read Monsters");
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
}

function Actions() {
  const { rollVisibility, setRollVisibility } = useRollVisibility();

  useEffect(() => {
    backgroundTask();
  }, []);

  const showStatblock = (itemId = "") => {
    OBR.popover.open({
      id: `${ID}/statblock`,
      url: `/statblock?id=${itemId}`,
      height: 550,
      width: 450,
      disableClickAway: true,
      anchorOrigin: { horizontal: "RIGHT", vertical: "TOP" },
      marginThreshold: 75,
    });
    OBR.action.close();
  };

  OBR.broadcast.onMessage(
    "com.missing-link-dev.battle-board/item-added",
    (event) => {
      console.log(event.data);
      if (typeof event.data === "string") {
        OBR.scene.items.updateItems([event.data], (items) => {
          for (const item of items) {
            const monster: any = item.metadata[`${ID}/monster`];
            const battleBoard: any =
              item.metadata["com.missing-link-dev.battle-board/metadata"];

            if (
              item.layer !== "CHARACTER" ||
              !monster ||
              !battleBoard?.inInitiative
            ) {
              continue;
            }

            battleBoard.initiative = rollInitiative(monster);

            if (monster?.hp?.formula) {
              const hp = dice.roll(monster.hp.formula).total;
              battleBoard.maxHP = hp;
              battleBoard.currentHP = hp;
            }
            battleBoard.ac = monster.ac[0].ac || monster.ac[0];
          }
        });
      }
    },
  );

  OBR.broadcast.onMessage(
    "com.missing-link-dev.battle-board/selected",
    (event) => {
      if (typeof event.data === "string") {
        showStatblock(event.data);
      }
    },
  );

  return (
    <Stack spacing={2}>
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel id="roll-visibility-label">Roll Visibility</InputLabel>
        <Select
          labelId="roll-visibility-label"
          id="roll-visibility-select"
          value={rollVisibility}
          label="Roll Visibility"
          onChange={(e) => setRollVisibility(e.target.value)}
        >
          <MenuItem value="everyone">
            <Box display="flex" alignItems="center" gap={1}>
              <PeopleIcon fontSize="small" />
              <Typography>Everyone</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="gm_only">
            <Box display="flex" alignItems="center" gap={1}>
              <VisibilityOffIcon fontSize="small" />
              <Typography>GM Only</Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
      <Button variant="outlined" fullWidth onClick={() => showStatblock()}>
        Show
      </Button>
    </Stack>
  );
}

export default Actions;
