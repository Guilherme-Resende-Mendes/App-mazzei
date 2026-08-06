import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { ForbiddenError, NotFoundError } from '../../../shared/errors/AppError';
import {
  HiringResponseDTO,
  RejectCandidateInput,
} from '../../dto/application.dto';
import { HiringMapper } from '../../mappers/HiringMapper';
import { resolveRestaurantByUser } from '../jobs/resolveJobOwnership';

export class RejectCandidateUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly hiringRepository: HiringRepository,
  ) {}

  async execute(input: RejectCandidateInput): Promise<HiringResponseDTO> {
    const restaurant = await resolveRestaurantByUser(
      this.restaurantRepository,
      input.userId,
    );

    const hiring = await this.hiringRepository.findById(input.hiringId);

    if (!hiring) {
      throw new NotFoundError('Candidatura nao encontrada.');
    }

    if (hiring.restaurantId !== restaurant.id) {
      throw new ForbiddenError(
        'Esta candidatura nao pertence ao seu restaurante.',
      );
    }

    hiring.reject();

    const updated = await this.hiringRepository.update(hiring);

    return HiringMapper.toResponse(updated);
  }
}
