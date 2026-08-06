import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import {
  HiringResponseDTO,
  ListCandidateApplicationsInput,
} from '../../dto/application.dto';
import { HiringMapper } from '../../mappers/HiringMapper';
import { resolveCandidateByUser } from './resolveCandidate';

export class ListCandidateApplicationsUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly hiringRepository: HiringRepository,
  ) {}

  async execute(
    input: ListCandidateApplicationsInput,
  ): Promise<HiringResponseDTO[]> {
    const candidate = await resolveCandidateByUser(
      this.candidateRepository,
      input.userId,
    );

    const hirings = await this.hiringRepository.listByCandidate(candidate.id);

    return hirings.map(HiringMapper.toResponse);
  }
}
