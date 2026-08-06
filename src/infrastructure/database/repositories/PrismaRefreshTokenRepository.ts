import { RefreshToken } from '../../../domain/entities/RefreshToken';
import {
  CreateRefreshTokenData,
  RefreshTokenRepository,
} from '../../../domain/repositories/RefreshTokenRepository';
import { Database } from '../prisma/client';
import { RefreshTokenPrismaMapper } from '../mappers/RefreshTokenPrismaMapper';

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: Database) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const row = await this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent ?? null,
        ip: data.ip ?? null,
      },
    });

    return RefreshTokenPrismaMapper.toDomain(row);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const row = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
    });

    return row ? RefreshTokenPrismaMapper.toDomain(row) : null;
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
