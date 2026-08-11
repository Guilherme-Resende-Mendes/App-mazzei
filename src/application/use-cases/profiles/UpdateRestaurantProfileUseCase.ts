import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import {
  RestaurantResponseDTO,
  UpdateRestaurantProfileInput,
} from '../../dto/profile.dto';
import { RestaurantMapper } from '../../mappers/RestaurantMapper';

export class UpdateRestaurantProfileUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(
    input: UpdateRestaurantProfileInput,
  ): Promise<RestaurantResponseDTO> {
    const restaurant = await this.restaurantRepository.findByUserId(
      input.userId,
    );

    if (!restaurant) {
      throw new NotFoundError('Perfil de restaurante nao encontrado.');
    }

    restaurant.update({
      name: input.name,
      address: input.address,
      phone: input.phone,
      requirementLevel: input.requirementLevel,
      bio: input.bio,
    });

    const updated = await this.restaurantRepository.update(restaurant);

    return RestaurantMapper.toResponse(updated);
  }
}
