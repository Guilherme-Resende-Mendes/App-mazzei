import { Hiring } from '../../../domain/entities/Hiring';
import { HiringStatus } from '../../../domain/enums/HiringStatus';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { PrismaClientOrTx } from '../prisma/client';
import { HiringPrismaMapper } from '../mappers/HiringPrismaMapper';
import { HiringStatusMapper } from '../mappers/HiringStatusMapper';
import { nullableNumberToDecimalMoney, numberToDecimalMoney } from '../mappers/prismaFieldHelpers';

export class PrismaHiringRepository implements HiringRepository {
  constructor(private readonly prisma: PrismaClientOrTx) {}

  async create(hiring: Hiring): Promise<Hiring> {
    const row = await this.prisma.hiring.create({
      data: {
        id: hiring.id,
        jobId: hiring.jobId,
        candidateId: hiring.candidateId,
        restaurantId: hiring.restaurantId,
        hourlyRate: numberToDecimalMoney(hiring.hourlyRate),
        agreedPrice: nullableNumberToDecimalMoney(hiring.agreedPrice),
        status: HiringStatusMapper.toPrisma(hiring.status),
        requestedAt: hiring.requestedAt,
        respondedAt: hiring.respondedAt,
      },
    });

    return HiringPrismaMapper.toDomain(row);
  }

  async update(hiring: Hiring): Promise<Hiring> {
    const row = await this.prisma.hiring.update({
      where: { id: hiring.id },
      data: {
        hourlyRate: numberToDecimalMoney(hiring.hourlyRate),
        agreedPrice: nullableNumberToDecimalMoney(hiring.agreedPrice),
        status: HiringStatusMapper.toPrisma(hiring.status),
        requestedAt: hiring.requestedAt,
        respondedAt: hiring.respondedAt,
        deliveryRating: hiring.deliveryRating,
        punctualityRating: hiring.punctualityRating,
        cancellationFault: hiring.cancellationFault,
      },
    });

    return HiringPrismaMapper.toDomain(row);
  }

  async findById(id: string): Promise<Hiring | null> {
    const row = await this.prisma.hiring.findUnique({ where: { id } });
    return row ? HiringPrismaMapper.toDomain(row) : null;
  }

  async findByJobAndCandidate(
    jobId: string,
    candidateId: string,
  ): Promise<Hiring | null> {
    const row = await this.prisma.hiring.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
    });

    return row ? HiringPrismaMapper.toDomain(row) : null;
  }

  async listByJob(jobId: string): Promise<Hiring[]> {
    const rows = await this.prisma.hiring.findMany({
      where: { jobId },
      orderBy: { requestedAt: 'asc' },
    });

    return rows.map(HiringPrismaMapper.toDomain);
  }

  async listByCandidate(candidateId: string): Promise<Hiring[]> {
    const rows = await this.prisma.hiring.findMany({
      where: { candidateId },
      orderBy: { requestedAt: 'desc' },
    });

    return rows.map(HiringPrismaMapper.toDomain);
  }

  async countByJobAndStatus(
    jobId: string,
    status: HiringStatus,
  ): Promise<number> {
    return this.prisma.hiring.count({
      where: { jobId, status: HiringStatusMapper.toPrisma(status) },
    });
  }

  async cancelPendingByJob(jobId: string, now: Date): Promise<void> {
    await this.prisma.hiring.updateMany({
      where: {
        jobId,
        status: HiringStatusMapper.toPrisma(HiringStatus.SOLICITADA),
      },
      data: {
        status: HiringStatusMapper.toPrisma(HiringStatus.CANCELADA),
        respondedAt: now,
      },
    });
  }
}
