import { Job } from '../../../domain/entities/Job';
import { Restaurant } from '../../../domain/entities/Restaurant';
import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { ForbiddenError, NotFoundError } from '../../../shared/errors/AppError';

export async function resolveRestaurantByUser(
  restaurantRepository: RestaurantRepository,
  userId: string,
): Promise<Restaurant> {
  const restaurant = await restaurantRepository.findByUserId(userId);

  if (!restaurant) {
    throw new ForbiddenError('E necessario ter um perfil de restaurante.');
  }

  return restaurant;
}

export async function resolveOwnedJob(
  restaurantRepository: RestaurantRepository,
  jobRepository: JobRepository,
  userId: string,
  jobId: string,
): Promise<{ restaurant: Restaurant; job: Job }> {
  const restaurant = await resolveRestaurantByUser(
    restaurantRepository,
    userId,
  );
  const job = await jobRepository.findById(jobId);

  if (!job || job.isDeleted()) {
    throw new NotFoundError('Vaga nao encontrada.');
  }

  if (!job.isOwnedBy(restaurant.id)) {
    throw new ForbiddenError('Voce nao e o dono desta vaga.');
  }

  return { restaurant, job };
}
