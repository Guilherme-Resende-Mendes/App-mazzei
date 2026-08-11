import { Hiring } from '../../../domain/entities/Hiring';
import { Hiring as PrismaHiring } from '../prisma/generated/client';
import { HiringStatusMapper } from './HiringStatusMapper';
import {
  decimalToNumber,
  nullableDecimalToMoneyNumber,
  nullableDecimalToNumber,
} from './prismaFieldHelpers';

export class HiringPrismaMapper {
  static toDomain(row: PrismaHiring): Hiring {
    return Hiring.restore({
      id: row.id,
      jobId: row.jobId,
      candidateId: row.candidateId,
      restaurantId: row.restaurantId,
      hourlyRate: decimalToNumber(row.hourlyRate),
      agreedPrice: nullableDecimalToMoneyNumber(row.agreedPrice),
      status: HiringStatusMapper.toDomain(row.status),
      requestedAt: row.requestedAt,
      respondedAt: row.respondedAt,
      deliveryRating: nullableDecimalToNumber(row.deliveryRating),
      punctualityRating: nullableDecimalToNumber(row.punctualityRating),
      cancellationFault: row.cancellationFault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
