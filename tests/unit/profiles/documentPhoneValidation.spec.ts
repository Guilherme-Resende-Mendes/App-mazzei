import { CreateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/CreateCandidateProfileUseCase';
import { CreateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { GetCandidateOwnCpfUseCase } from '../../../src/application/use-cases/profiles/GetCandidateOwnCpfUseCase';
import { GetCandidateOwnPhoneUseCase } from '../../../src/application/use-cases/profiles/GetCandidateOwnPhoneUseCase';
import { GetRestaurantOwnCpfCnpjUseCase } from '../../../src/application/use-cases/profiles/GetRestaurantOwnCpfCnpjUseCase';
import { GetRestaurantOwnPhoneUseCase } from '../../../src/application/use-cases/profiles/GetRestaurantOwnPhoneUseCase';
import { UpdateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/UpdateCandidateProfileUseCase';
import { UpdateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/UpdateRestaurantProfileUseCase';
import { Position } from '../../../src/domain/entities/Position';
import { Area } from '../../../src/domain/enums/Area';
import { InvalidCpfError } from '../../../src/domain/exceptions/InvalidCpfError';
import { InvalidCpfCnpjError } from '../../../src/domain/exceptions/InvalidCpfCnpjError';
import { InvalidPhoneError } from '../../../src/domain/exceptions/InvalidPhoneError';
import { FakeCepLookupProvider } from '../../support/FakeCepLookupProvider';
import { InMemoryCandidateRepository } from '../../support/InMemoryCandidateRepository';
import { InMemoryPositionRepository } from '../../support/InMemoryPositionRepository';
import { InMemoryRestaurantRepository } from '../../support/InMemoryRestaurantRepository';
import {
  VALID_CNPJ,
  VALID_CPF,
  VALID_CPF_2,
  VALID_PHONE,
  VALID_PHONE_2,
} from '../../support/validTestDocuments';
import { validTestAddress } from '../../support/validTestAddress';

const position = Position.restore({
  id: 'pos-1',
  area: Area.COZINHA,
  name: 'Cozinheiro',
  level: 2,
  active: true,
  createdAt: new Date(),
});

const cepLookup = new FakeCepLookupProvider();

describe('Profile document and phone validation', () => {
  it('bloqueia cadastro de restaurante com CPF/CNPJ invalido', async () => {
    const repo = new InMemoryRestaurantRepository();
    const useCase = new CreateRestaurantProfileUseCase(repo, cepLookup);

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'Restaurante',
        cpfCnpj: '12345678000199',
        address: validTestAddress(),
        phone: VALID_PHONE,
      }),
    ).rejects.toBeInstanceOf(InvalidCpfCnpjError);
  });

  it('bloqueia cadastro de candidato com CPF invalido', async () => {
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
        name: 'Candidato',
        document: '12345678901',
        address: validTestAddress(),
        phone: VALID_PHONE_2,
        positionId: position.id,
      }),
    ).rejects.toBeInstanceOf(InvalidCpfError);
  });

  it('bloqueia cadastro com telefone invalido', async () => {
    const repo = new InMemoryRestaurantRepository();
    const useCase = new CreateRestaurantProfileUseCase(repo, cepLookup);

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'Restaurante',
        cpfCnpj: VALID_CNPJ,
        address: validTestAddress(),
        phone: '123',
      }),
    ).rejects.toBeInstanceOf(InvalidPhoneError);
  });

  it('bloqueia atualizacao de telefone invalido', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    const create = new CreateCandidateProfileUseCase(
      candidates,
      positions,
      cepLookup,
    );
    const update = new UpdateCandidateProfileUseCase(
      candidates,
      positions,
      cepLookup,
    );

    await create.execute({
      userId: 'u1',
      name: 'Candidato',
      document: VALID_CPF,
      address: validTestAddress(),
      phone: VALID_PHONE_2,
      positionId: position.id,
    });

    await expect(
      update.execute({
        userId: 'u1',
        phone: '00999999999',
      }),
    ).rejects.toBeInstanceOf(InvalidPhoneError);
  });

  it('aceita atualizacao de telefone valido', async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const create = new CreateRestaurantProfileUseCase(restaurants, cepLookup);
    const update = new UpdateRestaurantProfileUseCase(restaurants, cepLookup);

    await create.execute({
      userId: 'u1',
      name: 'Restaurante',
      cpfCnpj: VALID_CNPJ,
      address: validTestAddress(),
      phone: VALID_PHONE,
    });

    await update.execute({
      userId: 'u1',
      phone: VALID_PHONE_2,
    });

    const phone = await new GetRestaurantOwnPhoneUseCase(restaurants).execute(
      'u1',
    );
    expect(phone.phone).toBe(VALID_PHONE_2);
  });

  it('normaliza CPF e telefone no cadastro de candidato', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    const useCase = new CreateCandidateProfileUseCase(
      candidates,
      positions,
      cepLookup,
    );

    await useCase.execute({
      userId: 'u1',
      name: 'Candidato',
      document: '529.982.247-25',
      address: validTestAddress(),
      phone: '+55 (11) 98888-8888',
      positionId: position.id,
    });

    const cpf = await new GetCandidateOwnCpfUseCase(candidates).execute('u1');
    const phone = await new GetCandidateOwnPhoneUseCase(candidates).execute(
      'u1',
    );

    expect(cpf.cpf).toBe(VALID_CPF);
    expect(phone.phone).toBe(VALID_PHONE_2);
  });

  it('aceita CPF como documento de restaurante', async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const useCase = new CreateRestaurantProfileUseCase(restaurants, cepLookup);

    await useCase.execute({
      userId: 'u1',
      name: 'Restaurante PF',
      cpfCnpj: VALID_CPF_2,
      address: validTestAddress(),
      phone: VALID_PHONE,
    });

    const cpfCnpj = await new GetRestaurantOwnCpfCnpjUseCase(restaurants).execute(
      'u1',
    );
    expect(cpfCnpj.cpfCnpj).toBe(VALID_CPF_2);
  });
});
