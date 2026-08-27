import { BadgeRepository } from '../../../domain/repositories/BadgeRepository';
import { CandidateBadgeRepository } from '../../../domain/repositories/CandidateBadgeRepository';
import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CandidateBadgesResponseDTO } from '../../dto/badge.dto';
import { CandidateBadgeMapper } from '../../mappers/CandidateBadgeMapper';
import { resolveCandidateByUser } from '../applications/resolveCandidate';
import { resolveGrantedBadges } from './resolveBadge';

/**
 * Placar de selos do freelancer: quais selos ele tem e quantas vezes recebeu cada um.
 * Selos nunca concedidos nao aparecem. Serve tanto a vitrine do proprio candidato
 * quanto a consulta do restaurante.
 */
export class GetCandidateBadgesUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly badgeRepository: BadgeRepository,
    private readonly candidateBadgeRepository: CandidateBadgeRepository,
  ) {}

  async executeByUserId(userId: string): Promise<CandidateBadgesResponseDTO> {
    const candidate = await resolveCandidateByUser(
      this.candidateRepository,
      userId,
    );

    return this.summarize(candidate.id);
  }

  async executeByCandidateId(
    candidateId: string,
  ): Promise<CandidateBadgesResponseDTO> {
    const candidate = await this.candidateRepository.findById(candidateId);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    return this.summarize(candidate.id);
  }

  private async summarize(
    candidateId: string,
  ): Promise<CandidateBadgesResponseDTO> {
    const grants =
      await this.candidateBadgeRepository.listByCandidate(candidateId);
    const catalog = await resolveGrantedBadges(this.badgeRepository, grants);

    return CandidateBadgeMapper.toSummaryResponse(candidateId, catalog, grants);
  }
}
