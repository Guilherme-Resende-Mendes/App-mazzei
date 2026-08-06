import { Restaurant } from '../../domain/entities/Restaurant';
import { RestaurantResponseDTO } from '../dto/profile.dto';

export class RestaurantMapper {
  static toResponse(restaurant: Restaurant): RestaurantResponseDTO {
    return {
      id: restaurant.id,
      userId: restaurant.userId,
      name: restaurant.name,
      cpfCnpj: restaurant.cpfCnpj,
      address: restaurant.address,
      phone: restaurant.phone,
      requirementLevel: restaurant.requirementLevel,
      active: restaurant.active,
      createdAt: restaurant.createdAt.toISOString(),
      updatedAt: restaurant.updatedAt.toISOString(),
    };
  }
}
