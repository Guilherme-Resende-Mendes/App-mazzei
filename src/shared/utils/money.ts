/** Arredonda valor monetario para 2 casas decimais. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Formata valor monetario com 2 casas decimais fixas (ex.: 100.1 -> "100.10"). */
export function formatMoney(value: number): string {
  return roundMoney(value).toFixed(2);
}

export function hasAtMostTwoDecimalPlaces(value: number): boolean {
  return Math.abs(roundMoney(value) - value) < 1e-9;
}
