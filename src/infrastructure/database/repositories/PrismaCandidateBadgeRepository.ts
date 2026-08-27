import { CandidateBadgeGrant } from '../../../domain/entities/CandidateBadgeGrant';
import { CandidateBadgeRepository } from '../../../domain/repositories/CandidateBadgeRepository';
import { PrismaClientOrTx } from '../prisma/client';
import { CandidateBadgeGrantPrismaMapper } from '../mappers/CandidateBadgeGrantPrismaMapper';

export class PrismaCandidateBadgeRepository implements CandidateBadgeRepository {
  constructor(private readonly prisma: PrismaClientOrTx) {}

  async create(grant: CandidateBadgeGrant): Promise<CandidateBadgeGrant> {
    const row = await this.prisma.candidateBadge.create({
      data: {
        id: grant.id,
        candidateId: grant.candidateId,
        restaurantId: grant.restaurantId,
        hiringId: grant.hiringId,
        badgeSlug: grant.badgeSlug,
        grantedAt: grant.grantedAt,
      },
    });

    return CandidateBadgeGrantPrismaMapper.toDomain(row);
  }

  async findByHiringAndBadge(
    hiringId: string,
    badgeSlug: string,
  ): Promise<CandidateBadgeGrant | null> {
    const row = await this.prisma.candidateBadge.findUnique({
      where: { hiringId_badgeSlug: { hiringId, badgeSlug } },
    });

    return row ? CandidateBadgeGrantPrismaMapper.toDomain(row) : null;
  }

  async listByCandidate(candidateId: string): Promise<CandidateBadgeGrant[]> {
    const rows = await this.prisma.candidateBadge.findMany({
      where: { candidateId },
      orderBy: { grantedAt: 'desc' },
    });

    return rows.map(CandidateBadgeGrantPrismaMapper.toDomain);
  }

  async listByHiring(hiringId: string): Promise<CandidateBadgeGrant[]> {
    const rows = await this.prisma.candidateBadge.findMany({
      where: { hiringId },
      orderBy: { grantedAt: 'desc' },
    });

    return rows.map(CandidateBadgeGrantPrismaMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.candidateBadge.delete({ where: { id } });
  }
}
