export interface GrantBadgeInput {
  /** Usuario autenticado; precisa ser o owner do restaurante da contratacao. */
  userId: string;
  hiringId: string;
  /** Slug do selo no catalogo (ex.: PONTUAL). */
  badge: string;
}

export interface RevokeBadgeInput {
  userId: string;
  hiringId: string;
  badge: string;
}

export interface ListHiringBadgesInput {
  userId: string;
  hiringId: string;
}

export interface BadgeResponseDTO {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
}

/** Concessao recem-criada, devolvida pelo POST. */
export interface BadgeGrantResponseDTO extends BadgeResponseDTO {
  candidateId: string;
  hiringId: string;
  grantedAt: string;
}

export interface CandidateBadgeCountDTO extends BadgeResponseDTO {
  count: number;
  lastGrantedAt: string | null;
}

/** Placar: contem apenas os selos que o candidato realmente recebeu. */
export interface CandidateBadgesResponseDTO {
  candidateId: string;
  totalGranted: number;
  badges: CandidateBadgeCountDTO[];
}
