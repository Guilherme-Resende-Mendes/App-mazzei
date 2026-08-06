import { Position } from '../../../src/domain/entities/Position';
import { Area } from '../../../src/domain/enums/Area';
import { Badge } from '../../../src/domain/enums/Badge';
import { CreateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/CreateRestaurantProfileUseCase';
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
        expectedSalary: 100,
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
      expectedSalary: 100,
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
