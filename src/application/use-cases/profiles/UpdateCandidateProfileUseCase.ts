import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import {
  NotFoundError,
  UnprocessableEntityError,
} from '../../../shared/errors/AppError';
import {
  CandidateResponseDTO,
  UpdateCandidateProfileInput,
} from '../../dto/profile.dto';
import { CandidateMapper } from '../../mappers/CandidateMapper';

export class UpdateCandidateProfileUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly positionRepository: PositionRepository,
  ) {}

  async execute(
    input: UpdateCandidateProfileInput,
  ): Promise<CandidateResponseDTO> {
    const candidate = await this.candidateRepository.findByUserId(input.userId);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

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

    candidate.update({
      name: input.name,
      address: input.address,
      phone: input.phone,
      positionId: input.positionId,
      bio: input.bio,
    });

    const updated = await this.candidateRepository.update(candidate);

    return CandidateMapper.toResponse(updated);
  }
}
