import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { Phone } from '../../../domain/value-objects/Phone';
import { NotFoundError } from '../../../shared/errors/AppError';
import {
  RestaurantResponseDTO,
  UpdateRestaurantProfileInput,
} from '../../dto/profile.dto';
import { CepLookupProvider } from '../../interfaces/CepLookupProvider';
import { AddressMapper } from '../../mappers/AddressMapper';
import { RestaurantMapper } from '../../mappers/RestaurantMapper';
import { validateAddressCep } from '../../services/validateAddressCep';

export class UpdateRestaurantProfileUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly cepLookupProvider: CepLookupProvider,
  ) {}

  async execute(
    input: UpdateRestaurantProfileInput,
  ): Promise<RestaurantResponseDTO> {
    const restaurant = await this.restaurantRepository.findByUserId(
      input.userId,
    );

    if (!restaurant) {
      throw new NotFoundError('Perfil de restaurante nao encontrado.');
    }

    let address = restaurant.address;

    if (input.address !== undefined) {
      address = AddressMapper.toDomain(input.address);
      await validateAddressCep(address, this.cepLookupProvider);
    }

    const phone =
      input.phone !== undefined ? Phone.create(input.phone).value : undefined;

    restaurant.update({
      name: input.name,
      address,
      phone,
      requirementLevel: input.requirementLevel,
      bio: input.bio,
    });

    const updated = await this.restaurantRepository.update(restaurant);

    return RestaurantMapper.toResponse(updated);
  }
}
