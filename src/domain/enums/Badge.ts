export enum Badge {
  PONTUAL = 'PONTUAL',
  FLEXIVEL = 'FLEXIVEL',
}

export const BADGES: readonly Badge[] = Object.values(Badge);

export function isBadge(value: string): value is Badge {
  return BADGES.includes(value as Badge);
}
