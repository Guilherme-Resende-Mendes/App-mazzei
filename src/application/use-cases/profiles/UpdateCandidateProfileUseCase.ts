import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { Phone } from '../../../domain/value-objects/Phone';
import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import {
  NotFoundError,
  UnprocessableEntityError,
} from '../../../shared/errors/AppError';
import {
  CandidateResponseDTO,
  UpdateCandidateProfileInput,
} from '../../dto/profile.dto';
import { CepLookupProvider } from '../../interfaces/CepLookupProvider';
import { AddressMapper } from '../../mappers/AddressMapper';
import { CandidateMapper } from '../../mappers/CandidateMapper';
import { validateAddressCep } from '../../services/validateAddressCep';

export class UpdateCandidateProfileUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly positionRepository: PositionRepository,
    private readonly cepLookupProvider: CepLookupProvider,
  ) {}

  async execute(
    input: UpdateCandidateProfileInput,
  ): Promise<CandidateResponseDTO> {
    const candidate = await this.candidateRepository.findByUserId(input.userId);

    if (!candidate) {
      throw new NotFoundError('Perfil de candidato nao encontrado.');
    }

    if (input.positionId !== undefined) {
      const positionActive = await this.positionRepository.isActive(
        input.positionId,
      );

      if (!positionActive) {
        throw new UnprocessableEntityError(
          'Cargo informado invalido ou inativo.',
        );
      }
    }

    let address = candidate.address;

    if (input.address !== undefined) {
      address = AddressMapper.toDomain(input.address);
      await validateAddressCep(address, this.cepLookupProvider);
    }

    const phone =
      input.phone !== undefined ? Phone.create(input.phone).value : undefined;

    candidate.update({
      name: input.name,
      address,
      phone,
      positionId: input.positionId,
      bio: input.bio,
    });

    const updated = await this.candidateRepository.update(candidate);

    return CandidateMapper.toResponse(updated);
  }
}
