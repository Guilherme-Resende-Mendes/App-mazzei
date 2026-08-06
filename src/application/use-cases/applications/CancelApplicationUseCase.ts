import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { ForbiddenError, NotFoundError } from '../../../shared/errors/AppError';
import {
  CancelApplicationInput,
  HiringResponseDTO,
} from '../../dto/application.dto';
import { HiringMapper } from '../../mappers/HiringMapper';
import { resolveCandidateByUser } from './resolveCandidate';

/**
 * O candidato cancela a propria candidatura. Se ja estava ACEITA, registra
 * falta (cancellationFault) para nao contar como avaliacao positiva.
 */
export class CancelApplicationUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly hiringRepository: HiringRepository,
  ) {}

  async execute(input: CancelApplicationInput): Promise<HiringResponseDTO> {
    const candidate = await resolveCandidateByUser(
      this.candidateRepository,
      input.userId,
    );

    const hiring = await this.hiringRepository.findById(input.hiringId);

    if (!hiring) {
      throw new NotFoundError('Candidatura nao encontrada.');
    }

    if (hiring.candidateId !== candidate.id) {
      throw new ForbiddenError('Esta candidatura nao pertence a voce.');
    }

    hiring.cancel();

    const updated = await this.hiringRepository.update(hiring);

    return HiringMapper.toResponse(updated);
  }
}
