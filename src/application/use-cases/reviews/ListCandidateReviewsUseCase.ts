import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { CandidateReviewDTO } from '../../dto/application.dto';
import { HiringMapper } from '../../mappers/HiringMapper';
import { resolveCandidateByUser } from '../applications/resolveCandidate';

/**
 * Historico de avaliacoes do freelancer (contratacoes concluidas com notas).
 */
export class ListCandidateReviewsUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly hiringRepository: HiringRepository,
  ) {}

  async execute(userId: string): Promise<CandidateReviewDTO[]> {
    const candidate = await resolveCandidateByUser(
      this.candidateRepository,
      userId,
    );

    const hirings = await this.hiringRepository.listByCandidate(candidate.id);

    return hirings
      .filter((hiring) => hiring.isConcluded())
      .map(HiringMapper.toReview);
  }
}
