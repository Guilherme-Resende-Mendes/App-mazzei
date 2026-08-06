import { Job } from '../../../domain/entities/Job';
import { JobRepository } from '../../../domain/repositories/JobRepository';
import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { JobSchedule } from '../../../domain/value-objects/JobSchedule';
import { UnprocessableEntityError } from '../../../shared/errors/AppError';
import { CreateJobInput, JobResponseDTO } from '../../dto/job.dto';
import { JobMapper } from '../../mappers/JobMapper';
import { resolveRestaurantByUser } from './resolveJobOwnership';

export class CreateJobUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
    private readonly positionRepository: PositionRepository,
  ) {}

  async execute(input: CreateJobInput): Promise<JobResponseDTO> {
    const restaurant = await resolveRestaurantByUser(
      this.restaurantRepository,
      input.userId,
    );

    const positionActive = await this.positionRepository.isActive(
      input.positionId,
    );

    if (!positionActive) {
      throw new UnprocessableEntityError(
        'Cargo informado invalido ou inativo.',
      );
    }

    const schedule = JobSchedule.create(
      JobSchedule.parseDateTimeString(input.startDate),
      JobSchedule.parseDateTimeString(input.endDate),
    );

    const job = Job.create({
      restaurantId: restaurant.id,
      positionId: input.positionId,
      schedule,
      peopleCount: input.peopleCount,
      notes: input.notes ?? null,
      active: input.active,
    });

    const created = await this.jobRepository.create(job);

    return JobMapper.toResponse(created);
  }
}
