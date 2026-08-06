import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { User as PrismaUser } from '../prisma/generated/client';
import { RoleMapper } from './RoleMapper';

export class UserPrismaMapper {
  static toDomain(row: PrismaUser): User {
    return User.restore({
      id: row.id,
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      role: RoleMapper.toDomain(row.role),
      active: row.active,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
