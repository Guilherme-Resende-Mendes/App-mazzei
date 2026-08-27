import { Badge } from '../../../domain/entities/Badge';
import { BadgeRepository } from '../../../domain/repositories/BadgeRepository';
import { PrismaClientOrTx } from '../prisma/client';
import { BadgePrismaMapper } from '../mappers/BadgePrismaMapper';

const CATALOG_ORDER = [{ sortOrder: 'asc' as const }, { slug: 'asc' as const }];

export class PrismaBadgeRepository implements BadgeRepository {
  constructor(private readonly prisma: PrismaClientOrTx) {}

  async findBySlug(slug: string): Promise<Badge | null> {
    const row = await this.prisma.badge.findUnique({ where: { slug } });
    return row ? BadgePrismaMapper.toDomain(row) : null;
  }

  async listActive(): Promise<Badge[]> {
    const rows = await this.prisma.badge.findMany({
      where: { active: true },
      orderBy: CATALOG_ORDER,
    });

    return rows.map(BadgePrismaMapper.toDomain);
  }

  async listBySlugs(slugs: string[]): Promise<Badge[]> {
    if (slugs.length === 0) {
      return [];
    }

    const rows = await this.prisma.badge.findMany({
      where: { slug: { in: slugs } },
      orderBy: CATALOG_ORDER,
    });

    return rows.map(BadgePrismaMapper.toDomain);
  }
}
