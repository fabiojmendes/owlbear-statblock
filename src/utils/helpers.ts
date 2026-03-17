export function parse5eToolsTags(text: string): string {
  if (!text) return "";

  // Replace {@hit +5} with +5
  text = text.replace(/{@hit\s+([^}]+)}/g, (_match, hit) => {
    const val = hit.startsWith("+") || hit.startsWith("-") ? hit : `+${hit}`;
    return `<span class="roll-link" data-notation="1d20${val}">${val}</span>`;
  });

  // Replace {@damage 1d6 + 3} with 1d6 + 3
  text = text.replace(/{@damage\s+([^}]+)}/g, (_match, damage) => {
    return `<span class="roll-link" data-notation="${damage}">${damage}</span>`;
  });

  text = text.replace(/{@atkr\s+m}/g, "Melee Attack:");
  text = text.replace(/{@atkr\s+r}/g, "Ranged Attack:");
  text = text.replace(/{@atk\s+mw}/g, "Melee Weapon Attack:");
  text = text.replace(/{@atk\s+rw}/g, "Ranged Weapon Attack:");
  text = text.replace(/{@atk\s+ms}/g, "Melee Spell Attack:");
  text = text.replace(/{@atk\s+rs}/g, "Ranged Spell Attack:");

  text = text.replace(/{@h}/g, "Hit:");

  text = text.replace(
    /{@(?:creature|spell|item|condition|disease|background|race|class|feat)\s+([^}|]+)(?:\|[^}]*)?}/g,
    "$1",
  );

  text = text.replace(/{@\w+\s+([^}]+)}/g, "$1");

  return text;
}

export function getModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getModifierNumber(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getPb(cr: any): number {
  let numericCr = 0;
  const crVal = typeof cr === "object" ? cr.cr : cr;
  if (typeof crVal === "string") {
    if (crVal.includes("/")) {
      const [num, den] = crVal.split("/").map(Number);
      numericCr = num / den;
    } else {
      numericCr = Number(crVal);
    }
  } else {
    numericCr = crVal || 0;
  }
  return Math.floor((Math.max(1, numericCr) - 1) / 4) + 2;
}

export function numericCrToNumber(cr: any): number {
  const crVal = typeof cr === "object" ? cr.cr : cr;
  if (typeof crVal === "string") {
    if (crVal.includes("/")) {
      const [num, den] = crVal.split("/").map(Number);
      return num / den;
    }
    return Number(crVal);
  }
  return crVal || 0;
}

export function getInitiativeBonus(monster: any): number {
  if (monster.initiative == null) {
    return getModifierNumber(monster.dex);
  }
  if (typeof monster.initiative === "number") {
    return monster.initiative;
  }
  if (typeof monster.initiative === "object") {
    if (typeof monster.initiative.initiative === "number") {
      return monster.initiative.initiative;
    }
    const pb = getPb(monster.cr);
    const profBonus =
      monster.initiative.proficiency && numericCrToNumber(monster.cr) < 100
        ? monster.initiative.proficiency * pb
        : 0;
    return getModifierNumber(monster.dex) + profBonus;
  }
  return getModifierNumber(monster.dex);
}

export function getPassiveInitiative(monster: any, initBonus: number): number {
  let advDisMod = 0;
  if (typeof monster.initiative === "object" && monster.initiative !== null) {
    if (monster.initiative.advantageMode === "adv") advDisMod = 5;
    else if (monster.initiative.advantageMode === "dis") advDisMod = -5;
  }
  return 10 + initBonus + advDisMod;
}
