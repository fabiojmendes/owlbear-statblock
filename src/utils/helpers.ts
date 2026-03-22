export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatBonus(bonus: number): string {
  return `${bonus >= 0 ? `+${bonus}` : `${bonus}`}`;
}
