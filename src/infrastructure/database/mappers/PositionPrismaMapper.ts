import { Position } from '../../../domain/entities/Position';
import { Position as PrismaPosition } from '../prisma/generated/client';
import { AreaMapper } from './AreaMapper';

export class PositionPrismaMapper {
  static toDomain(row: PrismaPosition): Position {
    return Position.restore({
      id: row.id,
      area: AreaMapper.toDomain(row.area),
      name: row.name,
      level: row.level,
      active: row.active,
      createdAt: row.createdAt,
    });
  }
}
