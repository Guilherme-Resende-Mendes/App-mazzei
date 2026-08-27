import { BadgeRepository } from '../../../domain/repositories/BadgeRepository';
import { BadgeResponseDTO } from '../../dto/badge.dto';
import { BadgeMapper } from '../../mappers/CandidateBadgeMapper';

/**
 * Catalogo de selos ativos. O front-end usa isto para renderizar rotulo e icone
 * sem manter um mapa proprio de selos.
 */
export class ListBadgesUseCase {
  constructor(private readonly badgeRepository: BadgeRepository) {}

  async execute(): Promise<BadgeResponseDTO[]> {
    const badges = await this.badgeRepository.listActive();
    return badges.map(BadgeMapper.toResponse);
  }
}
