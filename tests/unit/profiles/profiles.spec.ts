import { Position } from '../../../src/domain/entities/Position';
import { Area } from '../../../src/domain/enums/Area';
import { CreateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { GetRestaurantOwnCpfCnpjUseCase } from '../../../src/application/use-cases/profiles/GetRestaurantOwnCpfCnpjUseCase';
import { GetRestaurantOwnPhoneUseCase } from '../../../src/application/use-cases/profiles/GetRestaurantOwnPhoneUseCase';
import { GetCandidateOwnCpfUseCase } from '../../../src/application/use-cases/profiles/GetCandidateOwnCpfUseCase';
import { GetCandidateOwnPhoneUseCase } from '../../../src/application/use-cases/profiles/GetCandidateOwnPhoneUseCase';
import { CreateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/CreateCandidateProfileUseCase';
import { ListPositionsUseCase } from '../../../src/application/use-cases/profiles/ListPositionsUseCase';
import {
  ConflictError,
  UnprocessableEntityError,
} from '../../../src/shared/errors/AppError';
import { FakeCepLookupProvider } from '../../support/FakeCepLookupProvider';
import { InMemoryCandidateRepository } from '../../support/InMemoryCandidateRepository';
import { InMemoryPositionRepository } from '../../support/InMemoryPositionRepository';
import { InMemoryRestaurantRepository } from '../../support/InMemoryRestaurantRepository';
import { validTestAddress } from '../../support/validTestAddress';
import {
  VALID_CNPJ,
  VALID_CNPJ_2,
  VALID_CPF,
  VALID_PHONE,
  VALID_PHONE_2,
} from '../../support/validTestDocuments';

const position = Position.restore({
  id: 'pos-1',
  area: Area.COZINHA,
  name: 'Cozinheiro',
  level: 2,
  active: true,
  createdAt: new Date(),
});

const cepLookup = new FakeCepLookupProvider();

describe('Profiles use cases', () => {
  it('bloqueia segundo perfil de restaurante e cpf/cnpj duplicado', async () => {
    const repo = new InMemoryRestaurantRepository();
    const useCase = new CreateRestaurantProfileUseCase(repo, cepLookup);

    await useCase.execute({
      userId: 'u1',
      name: 'R1',
      cpfCnpj: VALID_CNPJ,
      address: validTestAddress(),
      phone: VALID_PHONE,
    });

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'R1b',
        cpfCnpj: VALID_CNPJ_2,
        address: validTestAddress(),
        phone: VALID_PHONE,
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    await expect(
      useCase.execute({
        userId: 'u2',
        name: 'R2',
        cpfCnpj: VALID_CNPJ,
        address: validTestAddress(),
        phone: VALID_PHONE,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('retorna cpf/cnpj e telefone apenas do usuario autenticado', async () => {
    const repo = new InMemoryRestaurantRepository();
    await new CreateRestaurantProfileUseCase(repo, cepLookup).execute({
      userId: 'u1',
      name: 'R1',
      cpfCnpj: VALID_CNPJ,
      address: validTestAddress(),
      phone: VALID_PHONE,
    });

    const cpfCnpj = await new GetRestaurantOwnCpfCnpjUseCase(repo).execute(
      'u1',
    );
    expect(cpfCnpj.cpfCnpj).toBe(VALID_CNPJ);

    const phone = await new GetRestaurantOwnPhoneUseCase(repo).execute('u1');
    expect(phone.phone).toBe(VALID_PHONE);
  });

  it('retorna cpf e telefone apenas do candidato autenticado', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    await new CreateCandidateProfileUseCase(
      candidates,
      positions,
      cepLookup,
    ).execute({
      userId: 'u1',
      name: 'C',
      document: VALID_CPF,
      address: validTestAddress(),
      phone: VALID_PHONE_2,
      positionId: position.id,
    });

    const cpf = await new GetCandidateOwnCpfUseCase(candidates).execute('u1');
    expect(cpf.cpf).toBe(VALID_CPF);

    const phone = await new GetCandidateOwnPhoneUseCase(candidates).execute(
      'u1',
    );
    expect(phone.phone).toBe(VALID_PHONE_2);
  });

  it('rejeita candidato com cargo inativo', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    const useCase = new CreateCandidateProfileUseCase(
      candidates,
      positions,
      cepLookup,
    );

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'C',
        document: VALID_CPF,
        address: validTestAddress(),
        phone: VALID_PHONE,
        positionId: 'inexistente',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('lista cargos por area', async () => {
    const positions = new InMemoryPositionRepository([position]);
    const useCase = new ListPositionsUseCase(positions);

    const all = await useCase.execute({});
    expect(all).toHaveLength(1);

    const bar = await useCase.execute({ area: Area.BAR });
    expect(bar).toHaveLength(0);
  });
});
