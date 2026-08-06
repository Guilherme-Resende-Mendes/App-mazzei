export enum HiringStatus {
  SOLICITADA = 'SOLICITADA',
  ACEITA = 'ACEITA',
  RECUSADA = 'RECUSADA',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export const HIRING_STATUSES: readonly HiringStatus[] =
  Object.values(HiringStatus);

export function isHiringStatus(value: string): value is HiringStatus {
  return HIRING_STATUSES.includes(value as HiringStatus);
}
