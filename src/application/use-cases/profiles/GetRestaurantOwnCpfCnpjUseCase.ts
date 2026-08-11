import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { RestaurantCpfCnpjResponseDTO } from '../../dto/profile.dto';

export class GetRestaurantOwnCpfCnpjUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(userId: string): Promise<RestaurantCpfCnpjResponseDTO> {
    const restaurant = await this.restaurantRepository.findByUserId(userId);

    if (!restaurant) {
      throw new NotFoundError('Perfil de restaurante nao encontrado.');
    }

    return { cpfCnpj: restaurant.cpfCnpj };
  }
}
