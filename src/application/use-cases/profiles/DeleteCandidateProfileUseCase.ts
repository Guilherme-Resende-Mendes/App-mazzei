import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class DeleteCandidateProfileUseCase {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(userId: string): Promise<void> {
    const candidate = await this.candidateRepository.findByUserId(userId);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    await this.candidateRepository.softDelete(candidate.id, new Date());
  }
}
