import { HiringStatus as DomainHiringStatus } from '../../../domain/enums/HiringStatus';
import { HiringStatus as PrismaHiringStatus } from '../prisma/generated/client';

const TO_DOMAIN: Record<PrismaHiringStatus, DomainHiringStatus> = {
  SOLICITADA: DomainHiringStatus.SOLICITADA,
  ACEITA: DomainHiringStatus.ACEITA,
  RECUSADA: DomainHiringStatus.RECUSADA,
  CONCLUIDA: DomainHiringStatus.CONCLUIDA,
  CANCELADA: DomainHiringStatus.CANCELADA,
};

const TO_PRISMA: Record<DomainHiringStatus, PrismaHiringStatus> = {
  [DomainHiringStatus.SOLICITADA]: PrismaHiringStatus.SOLICITADA,
  [DomainHiringStatus.ACEITA]: PrismaHiringStatus.ACEITA,
  [DomainHiringStatus.RECUSADA]: PrismaHiringStatus.RECUSADA,
  [DomainHiringStatus.CONCLUIDA]: PrismaHiringStatus.CONCLUIDA,
  [DomainHiringStatus.CANCELADA]: PrismaHiringStatus.CANCELADA,
};

export class HiringStatusMapper {
  static toDomain(status: PrismaHiringStatus): DomainHiringStatus {
    return TO_DOMAIN[status];
  }

  static toPrisma(status: DomainHiringStatus): PrismaHiringStatus {
    return TO_PRISMA[status];
  }
}
