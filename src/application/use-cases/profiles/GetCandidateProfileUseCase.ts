import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CandidateResponseDTO } from '../../dto/profile.dto';
import { CandidateMapper } from '../../mappers/CandidateMapper';

export class GetCandidateProfileUseCase {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async executeByUserId(userId: string): Promise<CandidateResponseDTO> {
    const candidate = await this.candidateRepository.findByUserId(userId);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    return CandidateMapper.toResponse(candidate);
  }

  async executeById(id: string): Promise<CandidateResponseDTO> {
    const candidate = await this.candidateRepository.findById(id);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    return CandidateMapper.toResponse(candidate);
  }
}
