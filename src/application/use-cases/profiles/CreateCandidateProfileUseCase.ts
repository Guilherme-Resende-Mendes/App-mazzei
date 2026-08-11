import { Candidate } from '../../../domain/entities/Candidate';
import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import {
  ConflictError,
  UnprocessableEntityError,
} from '../../../shared/errors/AppError';
import {
  CandidateResponseDTO,
  CreateCandidateProfileInput,
} from '../../dto/profile.dto';
import { CandidateMapper } from '../../mappers/CandidateMapper';

export class CreateCandidateProfileUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly positionRepository: PositionRepository,
  ) {}

  async execute(
    input: CreateCandidateProfileInput,
  ): Promise<CandidateResponseDTO> {
    const existingProfile = await this.candidateRepository.findByUserId(
      input.userId,
    );

    if (existingProfile) {
      throw new ConflictError('Este usuario ja possui um perfil de candidato.');
    }

    const documentInUse = await this.candidateRepository.existsByDocument(
      input.document,
    );

    if (documentInUse) {
      throw new ConflictError('Documento ja cadastrado.');
    }

    const positionActive = await this.positionRepository.isActive(
      input.positionId,
    );

    if (!positionActive) {
      throw new UnprocessableEntityError(
        'Cargo informado invalido ou inativo.',
      );
    }

    const candidate = Candidate.create({
      userId: input.userId,
      name: input.name,
      document: input.document,
      address: input.address,
      phone: input.phone,
      positionId: input.positionId,
      bio: input.bio ?? null,
    });

    const created = await this.candidateRepository.create(candidate);

    return CandidateMapper.toResponse(created);
  }
}
