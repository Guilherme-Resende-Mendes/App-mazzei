import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import {
  HiringResponseDTO,
  ListJobApplicationsInput,
} from '../../dto/application.dto';
import { HiringMapper } from '../../mappers/HiringMapper';
import { resolveOwnedJob } from '../jobs/resolveJobOwnership';

export class ListJobApplicationsUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
    private readonly hiringRepository: HiringRepository,
  ) {}

  async execute(input: ListJobApplicationsInput): Promise<HiringResponseDTO[]> {
    const { job } = await resolveOwnedJob(
      this.restaurantRepository,
      this.jobRepository,
      input.userId,
      input.jobId,
    );

    const hirings = await this.hiringRepository.listByJob(job.id);

    return hirings.map(HiringMapper.toResponse);
  }
}
