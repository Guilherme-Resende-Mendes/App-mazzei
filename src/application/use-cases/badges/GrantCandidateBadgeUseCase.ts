import { CandidateBadgeGrant } from '../../../domain/entities/CandidateBadgeGrant';
import { BadgeRepository } from '../../../domain/repositories/BadgeRepository';
import { CandidateBadgeRepository } from '../../../domain/repositories/CandidateBadgeRepository';
import { HiringRepository } from '../../../domain/repositories/HiringRepository';
import { RestaurantRepository } from '../../../domain/repositories/RestaurantRepository';
import { ConflictError } from '../../../shared/errors/AppError';
import { BadgeGrantResponseDTO, GrantBadgeInput } from '../../dto/badge.dto';
import { CandidateBadgeMapper } from '../../mappers/CandidateBadgeMapper';
import { resolveBadgeBySlug } from './resolveBadge';
import { resolveConcludedHiring } from './resolveConcludedHiring';

/**
 * O restaurante concede um selo ao freelancer que concluiu um trabalho seu.
 * Cada selo vale uma vez por contratacao, entao selos repetidos entre trabalhos
 * diferentes se acumulam no placar do candidato.
 *
 * Devolve apenas a concessao criada; o placar completo fica nas rotas de consulta.
 */
export class GrantCandidateBadgeUseCase {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly hiringRepository: HiringRepository,
    private readonly badgeRepository: BadgeRepository,
    private readonly candidateBadgeRepository: CandidateBadgeRepository,
  ) {}

  async execute(input: GrantBadgeInput): Promise<BadgeGrantResponseDTO> {
    const hiring = await resolveConcludedHiring(
      this.restaurantRepository,
      this.hiringRepository,
      input.userId,
      input.hiringId,
    );

    const badge = await resolveBadgeBySlug(
      this.badgeRepository,
      input.badge,
      true,
    );

    const existing = await this.candidateBadgeRepository.findByHiringAndBadge(
      hiring.id,
      badge.slug,
    );

    if (existing) {
      throw new ConflictError('Este selo ja foi concedido neste trabalho.');
    }

    const grant = await this.candidateBadgeRepository.create(
      CandidateBadgeGrant.create({
        candidateId: hiring.candidateId,
        restaurantId: hiring.restaurantId,
        hiringId: hiring.id,
        badgeSlug: badge.slug,
      }),
    );

    return CandidateBadgeMapper.toGrantResponse(grant, badge);
  }
}
