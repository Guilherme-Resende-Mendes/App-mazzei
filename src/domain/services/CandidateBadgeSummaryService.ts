import { Badge } from '../entities/Badge';
import { CandidateBadgeGrant } from '../entities/CandidateBadgeGrant';

export interface CandidateBadgeCount {
  badge: Badge;
  count: number;
  lastGrantedAt: Date | null;
}

/**
 * Agrega as concessoes num placar por selo. Somente selos efetivamente concedidos
 * entram: o candidato "tem" apenas os selos que recebeu, nunca o catalogo zerado.
 * A ordem segue a do catalogo recebido.
 */
export class CandidateBadgeSummaryService {
  static summarize(
    catalog: Badge[],
    grants: CandidateBadgeGrant[],
  ): CandidateBadgeCount[] {
    const summary: CandidateBadgeCount[] = [];

    for (const badge of catalog) {
      const ofBadge = grants.filter((grant) => grant.badgeSlug === badge.slug);

      if (ofBadge.length === 0) {
        continue;
      }

      const lastGrantedAt = ofBadge.reduce<Date | null>(
        (latest, grant) =>
          latest === null || grant.grantedAt > latest
            ? grant.grantedAt
            : latest,
        null,
      );

      summary.push({ badge, count: ofBadge.length, lastGrantedAt });
    }

    return summary;
  }
}
