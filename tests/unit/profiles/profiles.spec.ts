import { Position } from '../../../src/domain/entities/Position';
import { Area } from '../../../src/domain/enums/Area';
import { Badge } from '../../../src/domain/enums/Badge';
import { CreateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { GetRestaurantOwnCpfCnpjUseCase } from '../../../src/application/use-cases/profiles/GetRestaurantOwnCpfCnpjUseCase';
import { GetRestaurantOwnPhoneUseCase } from '../../../src/application/use-cases/profiles/GetRestaurantOwnPhoneUseCase';
import { GetCandidateOwnCpfUseCase } from '../../../src/application/use-cases/profiles/GetCandidateOwnCpfUseCase';
import { GetCandidateOwnPhoneUseCase } from '../../../src/application/use-cases/profiles/GetCandidateOwnPhoneUseCase';
import { CreateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/CreateCandidateProfileUseCase';
import { GrantCandidateBadgeUseCase } from '../../../src/application/use-cases/profiles/GrantCandidateBadgeUseCase';
import { RevokeCandidateBadgeUseCase } from '../../../src/application/use-cases/profiles/RevokeCandidateBadgeUseCase';
import { ListPositionsUseCase } from '../../../src/application/use-cases/profiles/ListPositionsUseCase';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../src/shared/errors/AppError';
import { InMemoryCandidateRepository } from '../../support/InMemoryCandidateRepository';
import { InMemoryPositionRepository } from '../../support/InMemoryPositionRepository';
import { InMemoryRestaurantRepository } from '../../support/InMemoryRestaurantRepository';

const position = Position.restore({
  id: 'pos-1',
  area: Area.COZINHA,
  name: 'Cozinheiro',
  level: 2,
  active: true,
  createdAt: new Date(),
});

describe('Profiles use cases', () => {
  it('bloqueia segundo perfil de restaurante e cpf/cnpj duplicado', async () => {
    const repo = new InMemoryRestaurantRepository();
    const useCase = new CreateRestaurantProfileUseCase(repo);

    await useCase.execute({
      userId: 'u1',
      name: 'R1',
      cpfCnpj: '123',
      address: 'rua',
      phone: '11999999999',
    });

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'R1b',
        cpfCnpj: '999',
        address: 'rua',
        phone: '11999999999',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    await expect(
      useCase.execute({
        userId: 'u2',
        name: 'R2',
        cpfCnpj: '123',
        address: 'rua',
        phone: '11999999999',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('retorna cpf/cnpj e telefone apenas do usuario autenticado', async () => {
    const repo = new InMemoryRestaurantRepository();
    await new CreateRestaurantProfileUseCase(repo).execute({
      userId: 'u1',
      name: 'R1',
      cpfCnpj: '12345678000199',
      address: 'rua',
      phone: '11999999999',
    });

    const cpfCnpj = await new GetRestaurantOwnCpfCnpjUseCase(repo).execute('u1');
    expect(cpfCnpj.cpfCnpj).toBe('12345678000199');

    const phone = await new GetRestaurantOwnPhoneUseCase(repo).execute('u1');
    expect(phone.phone).toBe('11999999999');
  });

  it('retorna cpf e telefone apenas do candidato autenticado', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    await new CreateCandidateProfileUseCase(candidates, positions).execute({
      userId: 'u1',
      name: 'C',
      document: '12345678901',
      address: 'rua',
      phone: '11988888888',
      positionId: position.id,
    });

    const cpf = await new GetCandidateOwnCpfUseCase(candidates).execute('u1');
    expect(cpf.cpf).toBe('12345678901');

    const phone = await new GetCandidateOwnPhoneUseCase(candidates).execute(
      'u1',
    );
    expect(phone.phone).toBe('11988888888');
  });

  it('rejeita candidato com cargo inativo', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    const useCase = new CreateCandidateProfileUseCase(candidates, positions);

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'C',
        document: 'doc',
        address: 'rua',
        phone: '11999999999',
        positionId: 'inexistente',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('concede e revoga selos (ADMIN), bloqueando duplicidade', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    await new CreateCandidateProfileUseCase(candidates, positions).execute({
      userId: 'u1',
      name: 'C',
      document: 'doc',
      address: 'rua',
      phone: '11999999999',
      positionId: position.id,
    });
    const candidateId = candidates.items[0].id;

    const grant = new GrantCandidateBadgeUseCase(candidates);
    const revoke = new RevokeCandidateBadgeUseCase(candidates);

    const granted = await grant.execute({ candidateId, badge: Badge.PONTUAL });
    expect(granted.badges).toHaveLength(1);

    await expect(
      grant.execute({ candidateId, badge: Badge.PONTUAL }),
    ).rejects.toBeInstanceOf(ConflictError);

    const revoked = await revoke.execute({ candidateId, badge: Badge.PONTUAL });
    expect(revoked.badges).toHaveLength(0);

    await expect(
      revoke.execute({ candidateId, badge: Badge.PONTUAL }),
    ).rejects.toBeInstanceOf(NotFoundError);
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
