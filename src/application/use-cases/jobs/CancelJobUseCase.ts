import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { JobOwnerActionInput, JobResponseDTO } from '../../dto/job.dto';
import { UnitOfWork } from '../../interfaces/UnitOfWork';
import { JobMapper } from '../../mappers/JobMapper';
import { resolveOwnedJob } from './resolveJobOwnership';

/**
 * Cancela a vaga e, atomicamente, cancela as candidaturas ainda pendentes.
 */
export class CancelJobUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(input: JobOwnerActionInput): Promise<JobResponseDTO> {
    const { job } = await resolveOwnedJob(
      this.restaurantRepository,
      this.jobRepository,
      input.userId,
      input.jobId,
    );

    const now = new Date();

    const updated = await this.unitOfWork.execute(async (ctx) => {
      const current = await ctx.jobs.findById(job.id);

      if (!current) {
        throw new NotFoundError('Vaga nao encontrada.');
      }

      current.cancel(now);
      const persisted = await ctx.jobs.update(current);
      await ctx.hirings.cancelPendingByJob(current.id, now);

      return persisted;
    });

    return JobMapper.toResponse(updated);
  }
}
