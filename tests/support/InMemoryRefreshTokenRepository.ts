import { randomUUID } from 'node:crypto';
import { RefreshToken } from '../../src/domain/entities/RefreshToken';
import {
  CreateRefreshTokenData,
  RefreshTokenRepository,
} from '../../src/domain/repositories/RefreshTokenRepository';

interface StoredToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  public readonly items: StoredToken[] = [];

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const record: StoredToken = {
      id: randomUUID(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      revokedAt: null,
      userAgent: data.userAgent ?? null,
      ip: data.ip ?? null,
      createdAt: new Date(),
    };

    this.items.push(record);
    return RefreshToken.restore(record);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const record = this.items.find((item) => item.tokenHash === tokenHash);
    return record ? RefreshToken.restore(record) : null;
  }

  async revokeById(id: string): Promise<void> {
    const record = this.items.find((item) => item.id === id);
    if (record && record.revokedAt === null) {
      record.revokedAt = new Date();
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    this.items
      .filter((item) => item.userId === userId && item.revokedAt === null)
      .forEach((item) => {
        item.revokedAt = new Date();
      });
  }
}
