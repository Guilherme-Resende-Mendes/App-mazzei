import { Hiring } from '../../../domain/entities/Hiring';
import { JobStatus } from '../../../domain/enums/JobStatus';
import { HiringStatus } from '../../../domain/enums/HiringStatus';
import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { JobRepository } from '../../../domain/repositories/JobRepository';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../shared/errors/AppError';
import { ApplyForJobInput, HiringResponseDTO } from '../../dto/application.dto';
import { HiringMapper } from '../../mappers/HiringMapper';
import { resolveCandidateByUser } from './resolveCandidate';

/**
 * Candidatura do freelancer a uma vaga, com todas as guardas de negocio.
 */
export class ApplyForJobUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly jobRepository: JobRepository,
    private readonly hiringRepository: HiringRepository,
  ) {}

  async execute(input: ApplyForJobInput): Promise<HiringResponseDTO> {
    const candidate = await resolveCandidateByUser(
      this.candidateRepository,
      input.userId,
    );

    const job = await this.jobRepository.findById(input.jobId);

    if (!job || job.isDeleted()) {
      throw new NotFoundError('Vaga nao encontrada.');
    }

    if (job.status !== JobStatus.ABERTA || !job.active) {
      throw new ConflictError('Esta vaga nao esta aberta para candidaturas.');
    }

    if (job.schedule.isPast()) {
      throw new UnprocessableEntityError('Esta vaga ja passou da data.');
    }

    const acceptedCount = await this.hiringRepository.countByJobAndStatus(
      job.id,
      HiringStatus.ACEITA,
    );

    if (acceptedCount >= job.peopleCount) {
      throw new ConflictError('Esta vaga ja foi preenchida.');
    }

    const existing = await this.hiringRepository.findByJobAndCandidate(
      job.id,
      candidate.id,
    );

    if (existing) {
      if (existing.status === HiringStatus.CANCELADA) {
        existing.reapply(input.hourlyRate);
        const updated = await this.hiringRepository.update(existing);
        return HiringMapper.toResponse(updated);
      }
      throw new ConflictError('Voce ja se candidatou para esta vaga.');
    }

    const hiring = Hiring.create({
      jobId: job.id,
      candidateId: candidate.id,
      restaurantId: job.restaurantId,
      hourlyRate: input.hourlyRate,
    });

    const created = await this.hiringRepository.create(hiring);

    return HiringMapper.toResponse(created);
  }
}
