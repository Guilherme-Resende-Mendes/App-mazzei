import { CandidateBadgeGrant } from '../../../domain/entities/CandidateBadgeGrant';
import { CandidateBadge as PrismaCandidateBadge } from '../prisma/generated/client';

export class CandidateBadgeGrantPrismaMapper {
  static toDomain(row: PrismaCandidateBadge): CandidateBadgeGrant {
    return CandidateBadgeGrant.restore({
      id: row.id,
      candidateId: row.candidateId,
      restaurantId: row.restaurantId,
      hiringId: row.hiringId,
      badgeSlug: row.badgeSlug,
      grantedAt: row.grantedAt,
    });
  }
}
