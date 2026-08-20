import { Restaurant } from '../../../domain/entities/Restaurant';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { PrismaClientOrTx } from '../prisma/client';
import { RestaurantPrismaMapper } from '../mappers/RestaurantPrismaMapper';
import { AddressPrismaMapper } from '../mappers/AddressPrismaMapper';

export class PrismaRestaurantRepository implements RestaurantRepository {
  constructor(private readonly prisma: PrismaClientOrTx) {}

  async create(restaurant: Restaurant): Promise<Restaurant> {
    const row = await this.prisma.restaurant.create({
      data: {
        id: restaurant.id,
        userId: restaurant.userId,
        name: restaurant.name,
        cpfCnpj: restaurant.cpfCnpj,
        address: AddressPrismaMapper.toPersistence(restaurant.address),
        phone: restaurant.phone,
        requirementLevel: restaurant.requirementLevel,
        bio: restaurant.bio,
      },
    });

    return RestaurantPrismaMapper.toDomain(row);
  }

  async update(restaurant: Restaurant): Promise<Restaurant> {
    const row = await this.prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: restaurant.name,
        address: AddressPrismaMapper.toPersistence(restaurant.address),
        phone: restaurant.phone,
        requirementLevel: restaurant.requirementLevel,
        bio: restaurant.bio,
        active: restaurant.active,
      },
    });

    return RestaurantPrismaMapper.toDomain(row);
  }

  async findById(id: string): Promise<Restaurant | null> {
    const row = await this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });

    return row ? RestaurantPrismaMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Restaurant | null> {
    const row = await this.prisma.restaurant.findFirst({
      where: { userId, deletedAt: null },
    });

    return row ? RestaurantPrismaMapper.toDomain(row) : null;
  }

  async existsByCpfCnpj(cpfCnpj: string): Promise<boolean> {
    const count = await this.prisma.restaurant.count({ where: { cpfCnpj } });
    return count > 0;
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    await this.prisma.restaurant.update({
      where: { id },
      data: { deletedAt, active: false },
    });
  }
}
