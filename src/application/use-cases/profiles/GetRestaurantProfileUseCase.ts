import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { RestaurantResponseDTO } from '../../dto/profile.dto';
import { RestaurantMapper } from '../../mappers/RestaurantMapper';

export class GetRestaurantProfileUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(userId: string): Promise<RestaurantResponseDTO> {
    const restaurant = await this.restaurantRepository.findByUserId(userId);

    if (!restaurant) {
      throw new NotFoundError('Perfil de restaurante nao encontrado.');
    }

    return RestaurantMapper.toResponse(restaurant);
  }
}
