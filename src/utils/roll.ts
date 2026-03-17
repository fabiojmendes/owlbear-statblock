import OBR from "@owlbear-rodeo/sdk";
import type React from "react";
import { ID } from "../main.tsx";

export async function handleD20RollClick(
  e: React.MouseEvent,
  bonus: number | string,
  target: string = "everyone",
  rollType: string = "roll",
) {
  let baseDice = "1d20";
  if (e.shiftKey) {
    baseDice = "2d20kh1";
  } else if (e.ctrlKey || e.metaKey) {
    baseDice = "2d20kl1";
  }

  let formattedBonus = String(bonus);
  if (
    !formattedBonus.startsWith("+") &&
    !formattedBonus.startsWith("-") &&
    Number(formattedBonus) >= 0
  ) {
    formattedBonus = `+${formattedBonus}`;
  } else if (Number(formattedBonus) < 0 && !formattedBonus.startsWith("-")) {
    formattedBonus = `-${Math.abs(Number(formattedBonus))}`;
  }

  const notation = `${baseDice}${formattedBonus}`;
  return handleRollClick(notation, target, rollType);
}

export async function handleRollClick(
  notation: string,
  target: string = "everyone",
  rollType: string = "roll",
) {
  if (!notation) return;

  const rollId = `roll_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  const playerId = await OBR.player.getId();
  const playerName = await OBR.player.getName();

  await OBR.broadcast.sendMessage(
    "dice-plus/roll-request",
    {
      rollId,
      playerId,
      playerName,
      rollTarget: target,
      diceNotation: notation,
      showResults: true,
      timestamp: Date.now(),
      source: `${ID}/${rollType}`,
    },
    { destination: "ALL" },
  );
}
