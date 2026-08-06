export enum JobStatus {
  ABERTA = 'ABERTA',
  PREENCHIDA = 'PREENCHIDA',
  CANCELADA = 'CANCELADA',
  CONCLUIDA = 'CONCLUIDA',
}

export const JOB_STATUSES: readonly JobStatus[] = Object.values(JobStatus);

export function isJobStatus(value: string): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus);
}
