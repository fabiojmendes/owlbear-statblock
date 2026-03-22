import OBR from "@owlbear-rodeo/sdk";
import type React from "react";
import { DICE_PLUS_ID, ID } from "../constants.ts";
import { formatBonus } from "./helpers.ts";

export async function handleD20RollClick(
  e: React.MouseEvent,
  bonus: number,
  rollType: string = "roll",
) {
  let baseDice = "1d20";
  if (e.shiftKey) {
    baseDice = "2d20kh1";
  } else if (e.ctrlKey || e.metaKey) {
    baseDice = "2d20kl1";
  }

  const notation = `${baseDice}${formatBonus(bonus)}`;
  return handleRollClick(notation, rollType);
}

export async function handleRollClick(
  notation: string,
  rollType: string = "roll",
) {
  if (!notation) return;

  const rollTarget =
    localStorage.getItem("statblock_roll_visibility") || "everyone";

  const rollId = `roll_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  const playerId = await OBR.player.getId();
  const playerName = await OBR.player.getName();

  await OBR.broadcast.sendMessage(
    `${DICE_PLUS_ID}/roll-request`,
    {
      rollId,
      playerId,
      playerName,
      rollTarget,
      diceNotation: notation,
      showResults: true,
      timestamp: Date.now(),
      source: `${ID}/${rollType}`,
    },
    { destination: "ALL" },
  );
}
