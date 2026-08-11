import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CandidateCpfResponseDTO } from '../../dto/profile.dto';

export class GetCandidateOwnCpfUseCase {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(userId: string): Promise<CandidateCpfResponseDTO> {
    const candidate = await this.candidateRepository.findByUserId(userId);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    return { cpf: candidate.document };
  }
}
