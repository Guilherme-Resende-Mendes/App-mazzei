import { Badge } from '../../../domain/entities/Badge';
import { Badge as PrismaBadge } from '../prisma/generated/client';

export class BadgePrismaMapper {
  static toDomain(row: PrismaBadge): Badge {
    return Badge.restore({
      slug: row.slug,
      name: row.name,
      description: row.description,
      icon: row.icon,
      active: row.active,
      sortOrder: row.sortOrder,
    });
  }
}
