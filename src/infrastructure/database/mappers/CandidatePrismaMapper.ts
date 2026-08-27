import { Candidate } from '../../../domain/entities/Candidate';
import { Candidate as PrismaCandidate } from '../prisma/generated/client';
import { AddressPrismaMapper } from './AddressPrismaMapper';
import { decimalToNumber } from './prismaFieldHelpers';

export class CandidatePrismaMapper {
  static toDomain(row: PrismaCandidate): Candidate {
    return Candidate.restore({
      id: row.id,
      userId: row.userId,
      name: row.name,
      document: row.document,
      address: AddressPrismaMapper.toDomain(row.address),
      phone: row.phone,
      positionId: row.positionId,
      overallRating: decimalToNumber(row.overallRating),
      bio: row.bio,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
