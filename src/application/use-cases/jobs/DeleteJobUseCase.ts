import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { JobOwnerActionInput } from '../../dto/job.dto';
import { resolveOwnedJob } from './resolveJobOwnership';

export class DeleteJobUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  async execute(input: JobOwnerActionInput): Promise<void> {
    const { job } = await resolveOwnedJob(
      this.restaurantRepository,
      this.jobRepository,
      input.userId,
      input.jobId,
    );

    await this.jobRepository.softDelete(job.id, new Date());
  }
}
