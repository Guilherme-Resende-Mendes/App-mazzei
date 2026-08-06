import { CandidateRatingService } from '../../../domain/services/CandidateRatingService';
import { JobRepository } from '../../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { Rating } from '../../../domain/value-objects/Rating';
import {
  BadRequestError,
  NotFoundError,
} from '../../../shared/errors/AppError';
import { FinishJobInput, JobResponseDTO } from '../../dto/job.dto';
import { UnitOfWork } from '../../interfaces/UnitOfWork';
import { JobMapper } from '../../mappers/JobMapper';
import { resolveOwnedJob } from './resolveJobOwnership';

/**
 * Conclui a vaga: o owner avalia cada contratacao aceita e a nota geral de cada
 * freelancer e recalculada. Tudo em uma unica transacao.
 */
export class FinishJobUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly jobRepository: JobRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(input: FinishJobInput): Promise<JobResponseDTO> {
    const { job } = await resolveOwnedJob(
      this.restaurantRepository,
      this.jobRepository,
      input.userId,
      input.jobId,
    );

    const evaluationByHiringId = new Map(
      input.evaluations.map((evaluation) => [evaluation.hiringId, evaluation]),
    );

    if (evaluationByHiringId.size !== input.evaluations.length) {
      throw new BadRequestError(
        'Avaliacoes duplicadas para a mesma contratacao.',
      );
    }

    const now = new Date();

    const updated = await this.unitOfWork.execute(async (ctx) => {
      const current = await ctx.jobs.findById(job.id);

      if (!current) {
        throw new NotFoundError('Vaga nao encontrada.');
      }

      const hirings = await ctx.hirings.listByJob(current.id);
      const accepted = hirings.filter((hiring) => hiring.isAccepted());

      if (evaluationByHiringId.size !== accepted.length) {
        throw new BadRequestError(
          'E necessario avaliar exatamente as contratacoes aceitas.',
        );
      }

      const affectedCandidates = new Set<string>();

      for (const hiring of accepted) {
        const evaluation = evaluationByHiringId.get(hiring.id);

        if (!evaluation) {
          throw new BadRequestError(
            'Ha contratacao aceita sem avaliacao correspondente.',
          );
        }

        hiring.conclude(
          Rating.create(evaluation.deliveryRating),
          Rating.create(evaluation.punctualityRating),
          now,
        );
        await ctx.hirings.update(hiring);
        affectedCandidates.add(hiring.candidateId);
      }

      current.finish(now);
      const persisted = await ctx.jobs.update(current);

      for (const candidateId of affectedCandidates) {
        const candidateHirings = await ctx.hirings.listByCandidate(candidateId);
        const rating = CandidateRatingService.calculate(candidateHirings);
        await ctx.candidates.updateOverallRating(
          candidateId,
          rating.toNumber(),
        );
      }

      return persisted;
    });

    return JobMapper.toResponse(updated);
  }
}
