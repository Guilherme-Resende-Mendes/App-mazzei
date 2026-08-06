import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class DeleteRestaurantProfileUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(userId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findByUserId(userId);

    if (!restaurant) {
      throw new NotFoundError('Perfil de restaurante nao encontrado.');
    }

    await this.restaurantRepository.softDelete(restaurant.id, new Date());
  }
}
