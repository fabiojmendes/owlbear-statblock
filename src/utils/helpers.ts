export function getModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getModifierNumber(score: number): number {
  return Math.floor((score - 10) / 2);
}
