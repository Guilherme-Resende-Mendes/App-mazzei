import { JobStatus } from '../../../domain/enums/JobStatus';
import { HiringStatus } from '../../../domain/enums/HiringStatus';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../shared/errors/AppError';
import {
  AcceptCandidateInput,
  HiringResponseDTO,
} from '../../dto/application.dto';
import { UnitOfWork } from '../../interfaces/UnitOfWork';
import { HiringMapper } from '../../mappers/HiringMapper';
import { resolveRestaurantByUser } from '../jobs/resolveJobOwnership';

/**
 * O owner aceita uma candidatura. Ao atingir qtd_pessoas aceitos, a vaga passa
 * a PREENCHIDA. Bloqueia aceites em excesso. Operacao atomica.
 */
export class AcceptCandidateUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly hiringRepository: HiringRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(input: AcceptCandidateInput): Promise<HiringResponseDTO> {
    const restaurant = await resolveRestaurantByUser(
      this.restaurantRepository,
      input.userId,
    );

    const hiring = await this.hiringRepository.findById(input.hiringId);

    if (!hiring) {
      throw new NotFoundError('Candidatura nao encontrada.');
    }

    if (hiring.restaurantId !== restaurant.id) {
      throw new ForbiddenError(
        'Esta candidatura nao pertence ao seu restaurante.',
      );
    }

    const now = new Date();

    const updated = await this.unitOfWork.execute(async (ctx) => {
      const current = await ctx.hirings.findById(hiring.id);

      if (!current) {
        throw new NotFoundError('Candidatura nao encontrada.');
      }

      const job = await ctx.jobs.findById(current.jobId);

      if (!job) {
        throw new NotFoundError('Vaga nao encontrada.');
      }

      if (job.status !== JobStatus.ABERTA) {
        throw new ConflictError('A vaga nao esta aberta para aceites.');
      }

      const acceptedCount = await ctx.hirings.countByJobAndStatus(
        job.id,
        HiringStatus.ACEITA,
      );

      if (acceptedCount >= job.peopleCount) {
        throw new ConflictError('A vaga ja atingiu o numero de contratados.');
      }

      current.accept(input.agreedPrice, now);
      const persisted = await ctx.hirings.update(current);

      if (acceptedCount + 1 >= job.peopleCount) {
        job.markFilled(now);
        await ctx.jobs.update(job);
      }

      return persisted;
    });

    return HiringMapper.toResponse(updated);
  }
}
