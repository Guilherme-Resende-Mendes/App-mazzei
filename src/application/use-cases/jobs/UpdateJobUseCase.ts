import { JobRepository } from '../../../domain/repositories/JobRepository';
import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { UnprocessableEntityError } from '../../../shared/errors/AppError';
import { JobResponseDTO, UpdateJobInput } from '../../dto/job.dto';
import { JobMapper } from '../../mappers/JobMapper';
import { resolveOwnedJob } from './resolveJobOwnership';

export class UpdateJobUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
    private readonly positionRepository: PositionRepository,
  ) {}

  async execute(input: UpdateJobInput): Promise<JobResponseDTO> {
    const { job } = await resolveOwnedJob(
      this.restaurantRepository,
      this.jobRepository,
      input.userId,
      input.jobId,
    );

    if (input.positionId !== undefined) {
      const positionActive = await this.positionRepository.isActive(
        input.positionId,
      );

      if (!positionActive) {
        throw new UnprocessableEntityError(
          'Cargo informado invalido ou inativo.',
        );
      }
    }

    job.update({
      positionId: input.positionId,
      peopleCount: input.peopleCount,
      notes: input.notes,
    });

    const updated = await this.jobRepository.update(job);

    return JobMapper.toResponse(updated);
  }
}
