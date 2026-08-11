import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { RestaurantPhoneResponseDTO } from '../../dto/profile.dto';

export class GetRestaurantOwnPhoneUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(userId: string): Promise<RestaurantPhoneResponseDTO> {
    const restaurant = await this.restaurantRepository.findByUserId(userId);

    if (!restaurant) {
      throw new NotFoundError('Perfil de restaurante nao encontrado.');
    }

    return { phone: restaurant.phone };
  }
}
