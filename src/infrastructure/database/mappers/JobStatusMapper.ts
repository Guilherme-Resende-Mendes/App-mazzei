import { JobStatus as DomainJobStatus } from '../../../domain/enums/JobStatus';
import { JobStatus as PrismaJobStatus } from '../prisma/generated/client';

const TO_DOMAIN: Record<PrismaJobStatus, DomainJobStatus> = {
  ABERTA: DomainJobStatus.ABERTA,
  PREENCHIDA: DomainJobStatus.PREENCHIDA,
  CANCELADA: DomainJobStatus.CANCELADA,
  CONCLUIDA: DomainJobStatus.CONCLUIDA,
};

const TO_PRISMA: Record<DomainJobStatus, PrismaJobStatus> = {
  [DomainJobStatus.ABERTA]: PrismaJobStatus.ABERTA,
  [DomainJobStatus.PREENCHIDA]: PrismaJobStatus.PREENCHIDA,
  [DomainJobStatus.CANCELADA]: PrismaJobStatus.CANCELADA,
  [DomainJobStatus.CONCLUIDA]: PrismaJobStatus.CONCLUIDA,
};

export class JobStatusMapper {
  static toDomain(status: PrismaJobStatus): DomainJobStatus {
    return TO_DOMAIN[status];
  }

  static toPrisma(status: DomainJobStatus): PrismaJobStatus {
    return TO_PRISMA[status];
  }
}
