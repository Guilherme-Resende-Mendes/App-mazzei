import { Restaurant } from '../../../domain/entities/Restaurant';
import { CpfCnpj } from '../../../domain/value-objects/CpfCnpj';
import { Phone } from '../../../domain/value-objects/Phone';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { ConflictError } from '../../../shared/errors/AppError';
import {
  CreateRestaurantProfileInput,
  RestaurantResponseDTO,
} from '../../dto/profile.dto';
import { CepLookupProvider } from '../../interfaces/CepLookupProvider';
import { AddressMapper } from '../../mappers/AddressMapper';
import { RestaurantMapper } from '../../mappers/RestaurantMapper';
import { validateAddressCep } from '../../services/validateAddressCep';

export class CreateRestaurantProfileUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly cepLookupProvider: CepLookupProvider,
  ) {}

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

    const cpfCnpj = CpfCnpj.create(input.cpfCnpj).value;
    const phone = Phone.create(input.phone).value;

    const cpfCnpjInUse = await this.restaurantRepository.existsByCpfCnpj(
      cpfCnpj,
    );

    if (cpfCnpjInUse) {
      throw new ConflictError('CPF/CNPJ ja cadastrado.');
    }

    const address = AddressMapper.toDomain(input.address);
    await validateAddressCep(address, this.cepLookupProvider);

    const restaurant = Restaurant.create({
      userId: input.userId,
      name: input.name,
      cpfCnpj,
      address,
      phone,
      requirementLevel: input.requirementLevel ?? null,
      bio: input.bio ?? null,
    });

    const created = await this.restaurantRepository.create(restaurant);

    return RestaurantMapper.toResponse(created);
  }
}
