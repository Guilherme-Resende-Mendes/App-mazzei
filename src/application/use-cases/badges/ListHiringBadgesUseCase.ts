import { BadgeRepository } from '../../../domain/repositories/BadgeRepository';
import { CandidateBadgeRepository } from '../../../domain/repositories/CandidateBadgeRepository';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import {
  CandidateBadgesResponseDTO,
  ListHiringBadgesInput,
} from '../../dto/badge.dto';
import { CandidateBadgeMapper } from '../../mappers/CandidateBadgeMapper';
import { resolveGrantedBadges } from './resolveBadge';
import { resolveConcludedHiring } from './resolveConcludedHiring';

/**
 * Selos que o restaurante ja concedeu num trabalho especifico. Lista vazia quando
 * nenhum selo foi concedido naquela contratacao.
 */
export class ListHiringBadgesUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly hiringRepository: HiringRepository,
    private readonly badgeRepository: BadgeRepository,
    private readonly candidateBadgeRepository: CandidateBadgeRepository,
  ) {}

  async execute(
    input: ListHiringBadgesInput,
  ): Promise<CandidateBadgesResponseDTO> {
    const hiring = await resolveConcludedHiring(
      this.restaurantRepository,
      this.hiringRepository,
      input.userId,
      input.hiringId,
    );

    const grants = await this.candidateBadgeRepository.listByHiring(hiring.id);
    const catalog = await resolveGrantedBadges(this.badgeRepository, grants);

    return CandidateBadgeMapper.toSummaryResponse(
      hiring.candidateId,
      catalog,
      grants,
    );
  }
}
