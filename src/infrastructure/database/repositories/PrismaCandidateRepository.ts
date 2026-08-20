import { Candidate } from '../../../domain/entities/Candidate';
import { Badge } from '../../../domain/enums/Badge';
import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { PrismaClientOrTx } from '../prisma/client';
import { BadgeMapper } from '../mappers/BadgeMapper';
import { CandidatePrismaMapper } from '../mappers/CandidatePrismaMapper';
import { AddressPrismaMapper } from '../mappers/AddressPrismaMapper';

export class PrismaCandidateRepository implements CandidateRepository {
  constructor(private readonly prisma: PrismaClientOrTx) {}

  async create(candidate: Candidate): Promise<Candidate> {
    const row = await this.prisma.candidate.create({
      data: {
        id: candidate.id,
        userId: candidate.userId,
        name: candidate.name,
        document: candidate.document,
        address: AddressPrismaMapper.toPersistence(candidate.address),
        phone: candidate.phone,
        positionId: candidate.positionId,
        overallRating: candidate.overallRating,
        bio: candidate.bio,
      },
      include: { badges: true },
    });

    return CandidatePrismaMapper.toDomain(row);
  }

  async update(candidate: Candidate): Promise<Candidate> {
    const row = await this.prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        name: candidate.name,
        address: AddressPrismaMapper.toPersistence(candidate.address),
        phone: candidate.phone,
        positionId: candidate.positionId,
        bio: candidate.bio,
        active: candidate.active,
      },
      include: { badges: true },
    });

    return CandidatePrismaMapper.toDomain(row);
  }

  async findById(id: string): Promise<Candidate | null> {
    const row = await this.prisma.candidate.findFirst({
      where: { id, deletedAt: null },
      include: { badges: true },
    });

    return row ? CandidatePrismaMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Candidate | null> {
    const row = await this.prisma.candidate.findFirst({
      where: { userId, deletedAt: null },
      include: { badges: true },
    });

    return row ? CandidatePrismaMapper.toDomain(row) : null;
  }

  async existsByDocument(document: string): Promise<boolean> {
    const count = await this.prisma.candidate.count({ where: { document } });
    return count > 0;
  }

  async updateOverallRating(id: string, rating: number): Promise<void> {
    await this.prisma.candidate.update({
      where: { id },
      data: { overallRating: rating },
    });
  }

  async addBadge(
    candidateId: string,
    badge: Badge,
    grantedAt: Date,
  ): Promise<void> {
    await this.prisma.candidateBadge.create({
      data: {
        candidateId,
        badge: BadgeMapper.toPrisma(badge),
        grantedAt,
      },
    });
  }

  async removeBadge(candidateId: string, badge: Badge): Promise<void> {
    await this.prisma.candidateBadge.delete({
      where: {
        candidateId_badge: {
          candidateId,
          badge: BadgeMapper.toPrisma(badge),
        },
      },
    });
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    await this.prisma.candidate.update({
      where: { id },
      data: { deletedAt, active: false },
    });
  }
}
