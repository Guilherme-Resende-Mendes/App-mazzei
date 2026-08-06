import { Position } from '../../../domain/entities/Position';
import { Area } from '../../../domain/enums/Area';
import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import { PrismaClientOrTx } from '../prisma/client';
import { AreaMapper } from '../mappers/AreaMapper';
import { PositionPrismaMapper } from '../mappers/PositionPrismaMapper';

export class PrismaPositionRepository implements PositionRepository {
  constructor(private readonly prisma: PrismaClientOrTx) {}

  async findById(id: string): Promise<Position | null> {
    const row = await this.prisma.position.findUnique({ where: { id } });
    return row ? PositionPrismaMapper.toDomain(row) : null;
  }

  async listByArea(area?: Area): Promise<Position[]> {
    const rows = await this.prisma.position.findMany({
      where: {
        active: true,
        area: area ? AreaMapper.toPrisma(area) : undefined,
      },
      orderBy: [{ area: 'asc' }, { level: 'asc' }],
    });

    return rows.map(PositionPrismaMapper.toDomain);
  }

  async isActive(id: string): Promise<boolean> {
    const count = await this.prisma.position.count({
      where: { id, active: true },
    });
    return count > 0;
  }
}
