import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { JobOwnerActionInput, JobResponseDTO } from '../../dto/job.dto';
import { JobMapper } from '../../mappers/JobMapper';
import { resolveOwnedJob } from './resolveJobOwnership';

export class ActivateJobUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  async execute(input: JobOwnerActionInput): Promise<JobResponseDTO> {
    const { job } = await resolveOwnedJob(
      this.restaurantRepository,
      this.jobRepository,
      input.userId,
      input.jobId,
    );

    job.activate();

    const updated = await this.jobRepository.update(job);

    return JobMapper.toResponse(updated);
  }
}
