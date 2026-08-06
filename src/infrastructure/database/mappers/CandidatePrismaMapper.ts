import { Candidate } from '../../../domain/entities/Candidate';
import {
  Candidate as PrismaCandidate,
  CandidateBadge as PrismaCandidateBadge,
} from '../prisma/generated/client';
import { BadgeMapper } from './BadgeMapper';
import { decimalToNumber } from './prismaFieldHelpers';

type CandidateRow = PrismaCandidate & {
  badges?: PrismaCandidateBadge[];
};

export class CandidatePrismaMapper {
  static toDomain(row: CandidateRow): Candidate {
    return Candidate.restore({
      id: row.id,
      userId: row.userId,
      name: row.name,
      document: row.document,
      address: row.address,
      phone: row.phone,
      positionId: row.positionId,
      expectedSalary: decimalToNumber(row.expectedSalary),
      overallRating: decimalToNumber(row.overallRating),
      bio: row.bio,
      badges: (row.badges ?? []).map((badge) => ({
        badge: BadgeMapper.toDomain(badge.badge),
        grantedAt: badge.grantedAt,
      })),
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
