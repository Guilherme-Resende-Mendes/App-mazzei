import { Candidate } from '../../../domain/entities/Candidate';
import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { PrismaClientOrTx } from '../prisma/client';
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
    });

    return CandidatePrismaMapper.toDomain(row);
  }

  async findById(id: string): Promise<Candidate | null> {
    const row = await this.prisma.candidate.findFirst({
      where: { id, deletedAt: null },
    });

    return row ? CandidatePrismaMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Candidate | null> {
    const row = await this.prisma.candidate.findFirst({
      where: { userId, deletedAt: null },
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

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    await this.prisma.candidate.update({
      where: { id },
      data: { deletedAt, active: false },
    });
  }
}
