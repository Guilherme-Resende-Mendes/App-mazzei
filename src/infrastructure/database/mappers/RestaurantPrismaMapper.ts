import { Restaurant } from '../../../domain/entities/Restaurant';
import { Restaurant as PrismaRestaurant } from '../prisma/generated/client';

export class RestaurantPrismaMapper {
  static toDomain(row: PrismaRestaurant): Restaurant {
    return Restaurant.restore({
      id: row.id,
      userId: row.userId,
      name: row.name,
      cpfCnpj: row.cpfCnpj,
      address: row.address,
      phone: row.phone,
      requirementLevel: row.requirementLevel,
      bio: row.bio,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
