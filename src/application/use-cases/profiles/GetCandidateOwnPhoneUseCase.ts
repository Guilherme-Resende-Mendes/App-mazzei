import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CandidatePhoneResponseDTO } from '../../dto/profile.dto';

export class GetCandidateOwnPhoneUseCase {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(userId: string): Promise<CandidatePhoneResponseDTO> {
    const candidate = await this.candidateRepository.findByUserId(userId);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    return { phone: candidate.phone };
  }
}
