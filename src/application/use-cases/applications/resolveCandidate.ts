import { Candidate } from '../../../domain/entities/Candidate';
import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { ForbiddenError } from '../../../shared/errors/AppError';

export async function resolveCandidateByUser(
  candidateRepository: CandidateRepository,
  userId: string,
): Promise<Candidate> {
  const candidate = await candidateRepository.findByUserId(userId);

  if (!candidate) {
    throw new ForbiddenError('E necessario ter um perfil de candidato.');
  }

  return candidate;
}
