import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { RefreshToken as PrismaRefreshToken } from '../prisma/generated/client';

export class RefreshTokenPrismaMapper {
  static toDomain(row: PrismaRefreshToken): RefreshToken {
    return RefreshToken.restore({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      userAgent: row.userAgent,
      ip: row.ip,
      createdAt: row.createdAt,
    });
  }
}
