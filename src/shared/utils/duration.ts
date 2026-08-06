const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Converte duracoes no formato `<numero><unidade>` (ex.: `15m`, `7d`) para ms.
 * Suporta segundos (s), minutos (m), horas (h) e dias (d).
 */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());

  if (!match) {
    throw new Error(`Duracao invalida: ${duration}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  return amount * UNIT_TO_MS[unit];
}
