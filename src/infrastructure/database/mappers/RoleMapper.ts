import { Role as DomainRole } from '../../../domain/enums/Role';
import { Role as PrismaRole } from '../prisma/generated/client';

const TO_DOMAIN: Record<PrismaRole, DomainRole> = {
  OWNER: DomainRole.OWNER,
  CLIENT: DomainRole.CLIENT,
  ADMIN: DomainRole.ADMIN,
};

const TO_PRISMA: Record<DomainRole, PrismaRole> = {
  [DomainRole.OWNER]: PrismaRole.OWNER,
  [DomainRole.CLIENT]: PrismaRole.CLIENT,
  [DomainRole.ADMIN]: PrismaRole.ADMIN,
};

export class RoleMapper {
  static toDomain(role: PrismaRole): DomainRole {
    return TO_DOMAIN[role];
  }

  static toPrisma(role: DomainRole): PrismaRole {
    return TO_PRISMA[role];
  }
}
