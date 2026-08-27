import { BadgeRepository } from '../../../domain/repositories/BadgeRepository';
import { CandidateBadgeRepository } from '../../../domain/repositories/CandidateBadgeRepository';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import {
  CandidateBadgesResponseDTO,
  RevokeBadgeInput,
} from '../../dto/badge.dto';
import { CandidateBadgeMapper } from '../../mappers/CandidateBadgeMapper';
import { resolveBadgeBySlug, resolveGrantedBadges } from './resolveBadge';
import { resolveConcludedHiring } from './resolveConcludedHiring';

/**
 * Desfaz uma concessao feita pelo proprio restaurante naquela contratacao e
 * devolve o placar atualizado do candidato.
 */
export class RevokeCandidateBadgeUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly hiringRepository: HiringRepository,
    private readonly badgeRepository: BadgeRepository,
    private readonly candidateBadgeRepository: CandidateBadgeRepository,
  ) {}

  async execute(input: RevokeBadgeInput): Promise<CandidateBadgesResponseDTO> {
    const hiring = await resolveConcludedHiring(
      this.restaurantRepository,
      this.hiringRepository,
      input.userId,
      input.hiringId,
    );

    const badge = await resolveBadgeBySlug(
      this.badgeRepository,
      input.badge,
      false,
    );

    const grant = await this.candidateBadgeRepository.findByHiringAndBadge(
      hiring.id,
      badge.slug,
    );

    if (!grant) {
      throw new NotFoundError('Selo nao concedido neste trabalho.');
    }

    await this.candidateBadgeRepository.delete(grant.id);

    const grants = await this.candidateBadgeRepository.listByCandidate(
      hiring.candidateId,
    );
    const catalog = await resolveGrantedBadges(this.badgeRepository, grants);

    return CandidateBadgeMapper.toSummaryResponse(
      hiring.candidateId,
      catalog,
      grants,
    );
  }
}
