import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { Database } from '../prisma/client';
import { RoleMapper } from '../mappers/RoleMapper';
import { UserPrismaMapper } from '../mappers/UserPrismaMapper';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async create(user: User): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email.value,
        passwordHash: user.passwordHash,
        role: RoleMapper.toPrisma(user.role),
      },
    });

    return UserPrismaMapper.toDomain(row);
  }

  async updateLastLogin(userId: string, date: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: date },
    });
  }
}
