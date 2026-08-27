import { Badge } from '../../domain/entities/Badge';
import { CandidateBadgeGrant } from '../../domain/entities/CandidateBadgeGrant';
import { CandidateBadgeSummaryService } from '../../domain/services/CandidateBadgeSummaryService';
import {
  BadgeGrantResponseDTO,
  BadgeResponseDTO,
  CandidateBadgesResponseDTO,
} from '../dto/badge.dto';

export class BadgeMapper {
  static toResponse(badge: Badge): BadgeResponseDTO {
    return {
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
    };
  }
}

export class CandidateBadgeMapper {
  static toGrantResponse(
    grant: CandidateBadgeGrant,
    badge: Badge,
  ): BadgeGrantResponseDTO {
    return {
      ...BadgeMapper.toResponse(badge),
      candidateId: grant.candidateId,
      hiringId: grant.hiringId,
      grantedAt: grant.grantedAt.toISOString(),
    };
  }

  static toSummaryResponse(
    candidateId: string,
    catalog: Badge[],
    grants: CandidateBadgeGrant[],
  ): CandidateBadgesResponseDTO {
    const summary = CandidateBadgeSummaryService.summarize(catalog, grants);

    return {
      candidateId,
      totalGranted: grants.length,
      badges: summary.map((item) => ({
        ...BadgeMapper.toResponse(item.badge),
        count: item.count,
        lastGrantedAt: item.lastGrantedAt?.toISOString() ?? null,
      })),
    };
  }
}
