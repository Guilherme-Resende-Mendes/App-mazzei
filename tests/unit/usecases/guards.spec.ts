import { Position } from '../../../src/domain/entities/Position';
import { Hiring } from '../../../src/domain/entities/Hiring';
import { HiringStatus } from '../../../src/domain/enums/HiringStatus';
import { Area } from '../../../src/domain/enums/Area';
import { GetRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/GetRestaurantProfileUseCase';
import { GetCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/GetCandidateProfileUseCase';
import { DeleteRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/DeleteRestaurantProfileUseCase';
import { DeleteCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/DeleteCandidateProfileUseCase';
import { UpdateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/UpdateRestaurantProfileUseCase';
import { UpdateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/UpdateCandidateProfileUseCase';
import { CreateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { CreateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/CreateCandidateProfileUseCase';
import { GetJobUseCase } from '../../../src/application/use-cases/jobs/GetJobUseCase';
import { UpdateJobUseCase } from '../../../src/application/use-cases/jobs/UpdateJobUseCase';
import { CreateJobUseCase } from '../../../src/application/use-cases/jobs/CreateJobUseCase';
import { ListRestaurantJobsUseCase } from '../../../src/application/use-cases/jobs/ListRestaurantJobsUseCase';
import { ListOpenJobsUseCase } from '../../../src/application/use-cases/jobs/ListOpenJobsUseCase';
import { ListCandidateApplicationsUseCase } from '../../../src/application/use-cases/applications/ListCandidateApplicationsUseCase';
import { HiringMapper } from '../../../src/application/mappers/HiringMapper';
import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../src/shared/errors/AppError';
import { InMemoryCandidateRepository } from '../../support/InMemoryCandidateRepository';
import { InMemoryHiringRepository } from '../../support/InMemoryHiringRepository';
import { InMemoryJobRepository } from '../../support/InMemoryJobRepository';
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

describe('Guardas de not found / forbidden', () => {
  it('perfis inexistentes lancam NotFound', async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const candidates = new InMemoryCandidateRepository();

    await expect(
      new GetRestaurantProfileUseCase(restaurants).execute('x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      new GetCandidateProfileUseCase(candidates).executeByUserId('x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      new GetCandidateProfileUseCase(candidates).executeById('x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      new DeleteRestaurantProfileUseCase(restaurants).execute('x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      new DeleteCandidateProfileUseCase(candidates).execute('x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      new UpdateRestaurantProfileUseCase(restaurants).execute({
        userId: 'x',
        name: 'n',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      new UpdateCandidateProfileUseCase(
        candidates,
        new InMemoryPositionRepository([position]),
      ).execute({ userId: 'x', name: 'n' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('atualiza perfil de candidato com cargo invalido -> 422', async () => {
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    await new CreateCandidateProfileUseCase(candidates, positions).execute({
      userId: 'u1',
      name: 'C',
      document: 'd',
      address: 'x',
      phone: '9',
      positionId: position.id,
    });

    await expect(
      new UpdateCandidateProfileUseCase(candidates, positions).execute({
        userId: 'u1',
        positionId: 'invalido',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);

    const ok = await new UpdateCandidateProfileUseCase(
      candidates,
      positions,
    ).execute({ userId: 'u1', positionId: position.id, name: 'Novo' });
    expect(ok.name).toBe('Novo');
  });

  it('acoes de vaga exigem restaurante e vaga existentes', async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const jobs = new InMemoryJobRepository();
    const positions = new InMemoryPositionRepository([position]);

    await expect(new GetJobUseCase(jobs).execute('x')).rejects.toBeInstanceOf(
      NotFoundError,
    );

    // sem restaurante -> Forbidden
    await expect(
      new UpdateJobUseCase(restaurants, jobs, positions).execute({
        userId: 'sem-rest',
        jobId: 'x',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    // com restaurante mas vaga inexistente -> NotFound
    await new CreateRestaurantProfileUseCase(restaurants).execute({
      userId: 'owner',
      name: 'R',
      cpfCnpj: '1',
      address: 'x',
      phone: '9',
    });
    await expect(
      new UpdateJobUseCase(restaurants, jobs, positions).execute({
        userId: 'owner',
        jobId: 'inexistente',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('CreateJob permite criar vaga inativa', async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const jobs = new InMemoryJobRepository();
    const positions = new InMemoryPositionRepository([position]);
    await new CreateRestaurantProfileUseCase(restaurants).execute({
      userId: 'owner',
      name: 'R',
      cpfCnpj: '1',
      address: 'x',
      phone: '9',
    });

    const created = await new CreateJobUseCase(
      restaurants,
      jobs,
      positions,
    ).execute({
      userId: 'owner',
      positionId: position.id,
      startDate: '15/06/2030 18:00',
      endDate: '15/06/2030 23:00',
      peopleCount: 1,
      active: false,
    });

    expect(created.active).toBe(false);
    expect(created.status).toBe('ABERTA');
  });

  it('CreateJob rejeita cargo inativo (422)', async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const jobs = new InMemoryJobRepository();
    const positions = new InMemoryPositionRepository([position]);
    await new CreateRestaurantProfileUseCase(restaurants).execute({
      userId: 'owner',
      name: 'R',
      cpfCnpj: '1',
      address: 'x',
      phone: '9',
    });

    await expect(
      new CreateJobUseCase(restaurants, jobs, positions).execute({
        userId: 'owner',
        positionId: 'invalido',
        startDate: '15/06/2030 18:00',
        endDate: '15/06/2030 23:00',
        peopleCount: 1,
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('listagens exigem restaurante/candidato (Forbidden)', async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const candidates = new InMemoryCandidateRepository();
    const jobs = new InMemoryJobRepository();
    const hirings = new InMemoryHiringRepository();

    await expect(
      new ListRestaurantJobsUseCase(restaurants, jobs).execute({
        userId: 'x',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    await expect(
      new ListCandidateApplicationsUseCase(candidates, hirings).execute({
        userId: 'x',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    const open = await new ListOpenJobsUseCase(jobs).execute({ page: 1 });
    expect(open.total).toBe(0);
  });

  it('HiringMapper.toReview lida com notas nulas', () => {
    const hiring = Hiring.restore({
      id: 'h',
      jobId: 'j',
      candidateId: 'c',
      restaurantId: 'r',
      hourlyRate: 100,
      agreedPrice: null,
      status: HiringStatus.CONCLUIDA,
      requestedAt: new Date(),
      respondedAt: null,
      deliveryRating: null,
      punctualityRating: null,
      cancellationFault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const review = HiringMapper.toReview(hiring);
    expect(review.average).toBe(0);
  });
});
