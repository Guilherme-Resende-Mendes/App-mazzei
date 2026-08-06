import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CandidateResponseDTO, RevokeBadgeInput } from '../../dto/profile.dto';
import { CandidateMapper } from '../../mappers/CandidateMapper';

export class RevokeCandidateBadgeUseCase {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(input: RevokeBadgeInput): Promise<CandidateResponseDTO> {
    const candidate = await this.candidateRepository.findById(
      input.candidateId,
    );

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    const hasBadge = candidate.badges.some(
      (badge) => badge.badge === input.badge,
    );

    if (!hasBadge) {
      throw new NotFoundError('Candidato nao possui este selo.');
    }

    await this.candidateRepository.removeBadge(candidate.id, input.badge);

    const updated = await this.candidateRepository.findById(candidate.id);

    return CandidateMapper.toResponse(updated ?? candidate);
  }
}
