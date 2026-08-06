import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { resolvePagination } from '../../../shared/utils/pagination';
import {
  JobResponseDTO,
  ListRestaurantJobsInput,
  PaginatedResponseDTO,
} from '../../dto/job.dto';
import { JobMapper } from '../../mappers/JobMapper';
import { resolveRestaurantByUser } from './resolveJobOwnership';

export class ListRestaurantJobsUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  async execute(
    input: ListRestaurantJobsInput,
  ): Promise<PaginatedResponseDTO<JobResponseDTO>> {
    const restaurant = await resolveRestaurantByUser(
      this.restaurantRepository,
      input.userId,
    );

    const pagination = resolvePagination(input.page, input.perPage);

    const result = await this.jobRepository.listByRestaurant(
      restaurant.id,
      { status: input.status, active: input.active },
      pagination,
    );

    return JobMapper.toPaginatedResponse(result);
  }
}
