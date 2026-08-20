import { CreateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/CreateCandidateProfileUseCase';
import { CreateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { Position } from '../../../src/domain/entities/Position';
import { Area } from '../../../src/domain/enums/Area';
import { UnprocessableEntityError } from '../../../src/shared/errors/AppError';
import { FakeCepLookupProvider } from '../../support/FakeCepLookupProvider';
import { InMemoryCandidateRepository } from '../../support/InMemoryCandidateRepository';
import { InMemoryPositionRepository } from '../../support/InMemoryPositionRepository';
import { InMemoryRestaurantRepository } from '../../support/InMemoryRestaurantRepository';
import { validTestAddress } from '../../support/validTestAddress';
import { VALID_CNPJ, VALID_CPF, VALID_PHONE } from '../../support/validTestDocuments';

const position = Position.restore({
  id: 'pos-1',
  area: Area.COZINHA,
  name: 'Cozinheiro',
  level: 2,
  active: true,
  createdAt: new Date(),
});

describe('Address CEP validation on profile creation', () => {
  it('bloqueia cadastro de restaurante com CEP inexistente', async () => {
    const repo = new InMemoryRestaurantRepository();
    const cepLookup = new FakeCepLookupProvider({ '99999999': null });
    const useCase = new CreateRestaurantProfileUseCase(repo, cepLookup);

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'Restaurante',
        cpfCnpj: VALID_CNPJ,
        address: validTestAddress({ cep: '99999999' }),
        phone: VALID_PHONE,
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('bloqueia cadastro de candidato quando rua nao corresponde ao CEP', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    const cepLookup = new FakeCepLookupProvider();
    const useCase = new CreateCandidateProfileUseCase(
      candidates,
      positions,
      cepLookup,
    );

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'Candidato',
        document: VALID_CPF,
        address: validTestAddress({ rua: 'Rua Inexistente' }),
        phone: VALID_PHONE,
        positionId: position.id,
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });
});
