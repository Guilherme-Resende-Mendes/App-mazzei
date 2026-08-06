export enum Area {
  COZINHA = 'COZINHA',
  SALAO = 'SALAO',
  BAR = 'BAR',
}

export const AREAS: readonly Area[] = Object.values(Area);

export function isArea(value: string): value is Area {
  return AREAS.includes(value as Area);
}
