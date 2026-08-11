import { Restaurant } from '../../../domain/entities/Restaurant';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { ConflictError } from '../../../shared/errors/AppError';
import {
  CreateRestaurantProfileInput,
  RestaurantResponseDTO,
} from '../../dto/profile.dto';
import { RestaurantMapper } from '../../mappers/RestaurantMapper';

export class CreateRestaurantProfileUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(
    input: CreateRestaurantProfileInput,
  ): Promise<RestaurantResponseDTO> {
    const existingProfile = await this.restaurantRepository.findByUserId(
      input.userId,
    );

    if (existingProfile) {
      throw new ConflictError(
        'Este usuario ja possui um perfil de restaurante.',
      );
    }

    const cpfCnpjInUse = await this.restaurantRepository.existsByCpfCnpj(
      input.cpfCnpj,
    );

    if (cpfCnpjInUse) {
      throw new ConflictError('CPF/CNPJ ja cadastrado.');
    }

    const restaurant = Restaurant.create({
      userId: input.userId,
      name: input.name,
      cpfCnpj: input.cpfCnpj,
      address: input.address,
      phone: input.phone,
      requirementLevel: input.requirementLevel ?? null,
      bio: input.bio ?? null,
    });

    const created = await this.restaurantRepository.create(restaurant);

    return RestaurantMapper.toResponse(created);
  }
}
