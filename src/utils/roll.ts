import OBR from "@owlbear-rodeo/sdk";
import { ID } from "../main.tsx";

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
