import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { JobSchedule } from '../../../domain/value-objects/JobSchedule';
import { JobResponseDTO, RescheduleJobInput } from '../../dto/job.dto';
import { JobMapper } from '../../mappers/JobMapper';
import { resolveOwnedJob } from './resolveJobOwnership';

export class RescheduleJobUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  async execute(input: RescheduleJobInput): Promise<JobResponseDTO> {
    const { job } = await resolveOwnedJob(
      this.restaurantRepository,
      this.jobRepository,
      input.userId,
      input.jobId,
    );

    const schedule = JobSchedule.create(
      JobSchedule.parseDateTimeString(input.startDate),
      JobSchedule.parseDateTimeString(input.endDate),
    );

    job.reschedule(schedule);

    const updated = await this.jobRepository.update(job);

    return JobMapper.toResponse(updated);
  }
}
