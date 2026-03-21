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
import { BATTLE_BOARD_ID, ID } from "../constants.ts";
import { useRollVisibility } from "../hooks/useRollVisibility.ts";
import { getInitiativeBonus } from "../utils/helpers.ts";
import { MonsterSchema } from "../utils/schema";

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
  const { rollVisibility, setRollVisibility } = useRollVisibility();

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

  OBR.broadcast.onMessage(`${BATTLE_BOARD_ID}/item-added`, (event) => {
    if (typeof event.data === "string") {
      OBR.scene.items.updateItems([event.data], (items) => {
        for (const item of items) {
          const rawMonster: any = item.metadata[`${ID}/monster`];
          const battleBoard: any = item.metadata[`${BATTLE_BOARD_ID}/metadata`];

          if (
            item.layer !== "CHARACTER" ||
            !rawMonster ||
            !battleBoard?.inInitiative
          ) {
            continue;
          }

          let monster: any;
          try {
            monster = MonsterSchema.parse(rawMonster);
          } catch (e) {
            console.error("Zod parsing failed in Actions:", e);
            monster = rawMonster;
          }

          battleBoard.initiative = rollInitiative(monster);

          if (monster?.hp?.formula) {
            const hp = dice.roll(monster.hp.formula).total;
            battleBoard.maxHP = hp;
            battleBoard.currentHP = hp;
          }
          battleBoard.ac =
            monster.ac?.[0]?.value ??
            monster.ac?.[0]?.ac ??
            monster.ac?.[0] ??
            10;
        }
      });
    }
  });

  OBR.broadcast.onMessage(`${BATTLE_BOARD_ID}/selected`, (event) => {
    if (typeof event.data === "string") {
      showStatblock(event.data);
    }
  });

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
