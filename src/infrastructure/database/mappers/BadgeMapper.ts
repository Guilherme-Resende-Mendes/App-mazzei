import { Badge as DomainBadge } from '../../../domain/enums/Badge';
import { Badge as PrismaBadge } from '../prisma/generated/client';

const TO_DOMAIN: Record<PrismaBadge, DomainBadge> = {
  PONTUAL: DomainBadge.PONTUAL,
  FLEXIVEL: DomainBadge.FLEXIVEL,
};

const TO_PRISMA: Record<DomainBadge, PrismaBadge> = {
  [DomainBadge.PONTUAL]: PrismaBadge.PONTUAL,
  [DomainBadge.FLEXIVEL]: PrismaBadge.FLEXIVEL,
};

export class BadgeMapper {
  static toDomain(badge: PrismaBadge): DomainBadge {
    return TO_DOMAIN[badge];
  }

  static toPrisma(badge: DomainBadge): PrismaBadge {
    return TO_PRISMA[badge];
  }
}
