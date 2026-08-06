import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { CandidateResponseDTO, GrantBadgeInput } from '../../dto/profile.dto';
import { CandidateMapper } from '../../mappers/CandidateMapper';

export class GrantCandidateBadgeUseCase {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(input: GrantBadgeInput): Promise<CandidateResponseDTO> {
    const candidate = await this.candidateRepository.findById(
      input.candidateId,
    );

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    const alreadyHasBadge = candidate.badges.some(
      (badge) => badge.badge === input.badge,
    );

    if (alreadyHasBadge) {
      throw new ConflictError('Candidato ja possui este selo.');
    }

    await this.candidateRepository.addBadge(
      candidate.id,
      input.badge,
      new Date(),
    );

    const updated = await this.candidateRepository.findById(candidate.id);

    return CandidateMapper.toResponse(updated ?? candidate);
  }
}
