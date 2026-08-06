import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import { ListPositionsInput, PositionResponseDTO } from '../../dto/profile.dto';
import { PositionMapper } from '../../mappers/CandidateMapper';

export class ListPositionsUseCase {
  constructor(private readonly positionRepository: PositionRepository) {}

  async execute(input: ListPositionsInput): Promise<PositionResponseDTO[]> {
    const positions = await this.positionRepository.listByArea(input.area);
    return positions.map(PositionMapper.toResponse);
  }
}
