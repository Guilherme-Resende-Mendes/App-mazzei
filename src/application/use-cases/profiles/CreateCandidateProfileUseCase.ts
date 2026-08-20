import { Candidate } from '../../../domain/entities/Candidate';
import { Cpf } from '../../../domain/value-objects/Cpf';
import { Phone } from '../../../domain/value-objects/Phone';
import { CandidateRepository } from '../../../domain/repositories/CandidateRepository';
import { PositionRepository } from '../../../domain/repositories/PositionRepository';
import {
  ConflictError,
  UnprocessableEntityError,
} from '../../../shared/errors/AppError';
import {
  CandidateResponseDTO,
  CreateCandidateProfileInput,
} from '../../dto/profile.dto';
import { CepLookupProvider } from '../../interfaces/CepLookupProvider';
import { AddressMapper } from '../../mappers/AddressMapper';
import { CandidateMapper } from '../../mappers/CandidateMapper';
import { validateAddressCep } from '../../services/validateAddressCep';

export class CreateCandidateProfileUseCase {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly positionRepository: PositionRepository,
    private readonly cepLookupProvider: CepLookupProvider,
  ) {}

  async execute(
    input: CreateCandidateProfileInput,
  ): Promise<CandidateResponseDTO> {
    const existingProfile = await this.candidateRepository.findByUserId(
      input.userId,
    );

    if (existingProfile) {
      throw new ConflictError('Este usuario ja possui um perfil de candidato.');
    }

    const document = Cpf.create(input.document).value;
    const phone = Phone.create(input.phone).value;

    const documentInUse = await this.candidateRepository.existsByDocument(
      document,
    );

    if (documentInUse) {
      throw new ConflictError('Documento ja cadastrado.');
    }

    const positionActive = await this.positionRepository.isActive(
      input.positionId,
    );

    if (!positionActive) {
      throw new UnprocessableEntityError(
        'Cargo informado invalido ou inativo.',
      );
    }

    const address = AddressMapper.toDomain(input.address);
    await validateAddressCep(address, this.cepLookupProvider);

    const candidate = Candidate.create({
      userId: input.userId,
      name: input.name,
      document,
      address,
      phone,
      positionId: input.positionId,
      bio: input.bio ?? null,
    });

    const created = await this.candidateRepository.create(candidate);

    return CandidateMapper.toResponse(created);
  }
}
