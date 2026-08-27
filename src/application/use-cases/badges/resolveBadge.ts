import { Badge, normalizeBadgeSlug } from '../../../domain/entities/Badge';
import { CandidateBadgeGrant } from '../../../domain/entities/CandidateBadgeGrant';
import { BadgeRepository } from '../../../domain/repositories/BadgeRepository';
import { UnprocessableEntityError } from '../../../shared/errors/AppError';

/**
 * Resolve o slug informado pela API contra o catalogo. Selos inativos continuam
 * resolviveis para permitir revogar concessoes antigas; conceder exige `requireActive`.
 */
export async function resolveBadgeBySlug(
  badgeRepository: BadgeRepository,
  slug: string,
  requireActive: boolean,
): Promise<Badge> {
  const badge = await badgeRepository.findBySlug(normalizeBadgeSlug(slug));

  if (!badge || (requireActive && !badge.active)) {
    throw new UnprocessableEntityError('Selo invalido ou inativo.');
  }

  return badge;
}

/**
 * Metadados apenas dos selos presentes nas concessoes. O placar mostra somente o
 * que o candidato recebeu, entao nao ha motivo para carregar o catalogo inteiro.
 */
export async function resolveGrantedBadges(
  badgeRepository: BadgeRepository,
  grants: CandidateBadgeGrant[],
): Promise<Badge[]> {
  const granted = [...new Set(grants.map((grant) => grant.badgeSlug))];
  return badgeRepository.listBySlugs(granted);
}
