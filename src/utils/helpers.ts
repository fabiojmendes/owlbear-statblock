export function getModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getModifierNumber(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(cr: any): number {
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

export function challengeRateToNumber(cr: any): number {
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
    const pb = getProficiencyBonus(monster.cr);
    const profBonus =
      monster.initiative.proficiency && challengeRateToNumber(monster.cr) < 100
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

const sizeMap: Record<string, string> = {
  T: "Tiny",
  S: "Small",
  M: "Medium",
  L: "Large",
  H: "Huge",
  G: "Gargantuan",
};

export function formatSize(size: string[]): string {
  return size.map((s) => sizeMap[s] || s).join(" or ");
}

const alignmentMap: Record<string, string> = {
  L: "lawful",
  C: "chaotic",
  N: "neutral",
  G: "good",
  E: "evil",
  A: "any alignment",
  U: "unaligned",
};

export function formatAlignment(alignment: string[]): string {
  if (
    alignment.length === 1 &&
    (alignment[0] === "A" || alignment[0] === "U")
  ) {
    return alignmentMap[alignment[0]];
  }
  return alignment.map((a) => alignmentMap[a] || a).join(" ");
}
