import { Restaurant } from '../../domain/entities/Restaurant';
import { RestaurantResponseDTO } from '../dto/profile.dto';
import { AddressMapper } from './AddressMapper';

export class RestaurantMapper {
  static toResponse(restaurant: Restaurant): RestaurantResponseDTO {
    return {
      id: restaurant.id,
      userId: restaurant.userId,
      name: restaurant.name,
      address: AddressMapper.toDTO(restaurant.address),
      requirementLevel: restaurant.requirementLevel,
      bio: restaurant.bio,
      active: restaurant.active,
      createdAt: restaurant.createdAt.toISOString(),
      updatedAt: restaurant.updatedAt.toISOString(),
    };
  }
}
