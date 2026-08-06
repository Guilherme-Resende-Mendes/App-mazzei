import { Area as DomainArea } from '../../../domain/enums/Area';
import { Area as PrismaArea } from '../prisma/generated/client';

const TO_DOMAIN: Record<PrismaArea, DomainArea> = {
  COZINHA: DomainArea.COZINHA,
  SALAO: DomainArea.SALAO,
  BAR: DomainArea.BAR,
};

const TO_PRISMA: Record<DomainArea, PrismaArea> = {
  [DomainArea.COZINHA]: PrismaArea.COZINHA,
  [DomainArea.SALAO]: PrismaArea.SALAO,
  [DomainArea.BAR]: PrismaArea.BAR,
};

export class AreaMapper {
  static toDomain(area: PrismaArea): DomainArea {
    return TO_DOMAIN[area];
  }

  static toPrisma(area: DomainArea): PrismaArea {
    return TO_PRISMA[area];
  }
}
