import { Hiring } from '../../../domain/entities/Hiring';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../shared/errors/AppError';
import { resolveRestaurantByUser } from '../jobs/resolveJobOwnership';

/**
 * Portao de entrada dos selos: so o restaurante dono da contratacao pode conceder,
 * e apenas depois que o freelancer concluiu o trabalho.
 */
export async function resolveConcludedHiring(
  restaurantRepository: RestaurantRepository,
  hiringRepository: HiringRepository,
  userId: string,
  hiringId: string,
): Promise<Hiring> {
  const restaurant = await resolveRestaurantByUser(
    restaurantRepository,
    userId,
  );

  const hiring = await hiringRepository.findById(hiringId);

  if (!hiring) {
    throw new NotFoundError('Contratacao nao encontrada.');
  }

  if (hiring.restaurantId !== restaurant.id) {
    throw new ForbiddenError(
      'Esta contratacao nao pertence ao seu restaurante.',
    );
  }

  if (!hiring.isConcluded()) {
    throw new ConflictError(
      'Selos so podem ser concedidos apos a conclusao do trabalho.',
    );
  }

  return hiring;
}
