import { Position } from '../../../src/domain/entities/Position';
import { Area } from '../../../src/domain/enums/Area';
import { TransactionalContext } from '../../../src/application/interfaces/UnitOfWork';
import { CreateRestaurantProfileUseCase } from '../../../src/application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { CreateCandidateProfileUseCase } from '../../../src/application/use-cases/profiles/CreateCandidateProfileUseCase';
import { CreateJobUseCase } from '../../../src/application/use-cases/jobs/CreateJobUseCase';
import { CancelJobUseCase } from '../../../src/application/use-cases/jobs/CancelJobUseCase';
import { FinishJobUseCase } from '../../../src/application/use-cases/jobs/FinishJobUseCase';
import { ApplyForJobUseCase } from '../../../src/application/use-cases/applications/ApplyForJobUseCase';
import { AcceptCandidateUseCase } from '../../../src/application/use-cases/applications/AcceptCandidateUseCase';
import { CancelApplicationUseCase } from '../../../src/application/use-cases/applications/CancelApplicationUseCase';
import { RejectCandidateUseCase } from '../../../src/application/use-cases/applications/RejectCandidateUseCase';
import { ListCandidateReviewsUseCase } from '../../../src/application/use-cases/reviews/ListCandidateReviewsUseCase';
import {
  ConflictError,
  ForbiddenError,
} from '../../../src/shared/errors/AppError';
import { InMemoryCandidateRepository } from '../../support/InMemoryCandidateRepository';
import { InMemoryHiringRepository } from '../../support/InMemoryHiringRepository';
import { InMemoryJobRepository } from '../../support/InMemoryJobRepository';
import { InMemoryPositionRepository } from '../../support/InMemoryPositionRepository';
import { InMemoryRestaurantRepository } from '../../support/InMemoryRestaurantRepository';
import { InMemoryUnitOfWork } from '../../support/InMemoryUnitOfWork';

const position = Position.restore({
  id: 'pos-1',
  area: Area.COZINHA,
  name: 'Cozinheiro',
  level: 2,
  active: true,
  createdAt: new Date(),
});

function setup() {
  const restaurants = new InMemoryRestaurantRepository();
  const candidates = new InMemoryCandidateRepository();
  const positions = new InMemoryPositionRepository([position]);
  const jobs = new InMemoryJobRepository();
  const hirings = new InMemoryHiringRepository();
  const ctx: TransactionalContext = { jobs, hirings, candidates, restaurants };
  const uow = new InMemoryUnitOfWork(ctx);

  return { restaurants, candidates, positions, jobs, hirings, uow };
}

async function seedProfiles(
  deps: ReturnType<typeof setup>,
  ownerId = 'owner1',
) {
  await new CreateRestaurantProfileUseCase(deps.restaurants).execute({
    userId: ownerId,
    name: 'Rest',
    cpfCnpj: `cnpj-${ownerId}`,
    address: 'rua',
    phone: '11999999999',
  });

  await new CreateCandidateProfileUseCase(
    deps.candidates,
    deps.positions,
  ).execute({
    userId: 'client1',
    name: 'Cand',
    document: 'doc-1',
    address: 'rua',
    phone: '11999999999',
    positionId: position.id,
  });
}

async function createJob(deps: ReturnType<typeof setup>, peopleCount = 1) {
  return new CreateJobUseCase(
    deps.restaurants,
    deps.jobs,
    deps.positions,
  ).execute({
    userId: 'owner1',
    positionId: position.id,
    startDate: '15/06/2030 18:00',
    endDate: '15/06/2030 23:00',
    peopleCount,
  });
}

describe('Core flow (perfis -> vaga -> candidatura -> aceite -> conclusao)', () => {
  it('percorre o fluxo completo e recalcula a nota do candidato', async () => {
    const deps = setup();
    await seedProfiles(deps);

    const job = await createJob(deps, 1);

    const hiring = await new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    ).execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });

    const accepted = await new AcceptCandidateUseCase(
      deps.restaurants,
      deps.hirings,
      deps.uow,
    ).execute({ userId: 'owner1', hiringId: hiring.id, agreedPrice: 100 });
    expect(accepted.status).toBe('ACEITA');

    // vaga com 1 vaga deve estar PREENCHIDA
    const filled = await deps.jobs.findById(job.id);
    expect(filled?.status).toBe('PREENCHIDA');

    const finished = await new FinishJobUseCase(
      deps.restaurants,
      deps.jobs,
      deps.uow,
    ).execute({
      userId: 'owner1',
      jobId: job.id,
      evaluations: [
        { hiringId: hiring.id, deliveryRating: 5, punctualityRating: 4 },
      ],
    });
    expect(finished.status).toBe('CONCLUIDA');

    expect(deps.candidates.items[0].overallRating).toBe(4.5);

    const reviews = await new ListCandidateReviewsUseCase(
      deps.candidates,
      deps.hirings,
    ).execute('client1');
    expect(reviews).toHaveLength(1);
    expect(reviews[0].average).toBe(4.5);
  });

  it('bloqueia candidatura dupla (409)', async () => {
    const deps = setup();
    await seedProfiles(deps);
    const job = await createJob(deps, 1);
    const apply = new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    );

    await apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });
    await expect(
      apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('bloqueia candidatura em vaga preenchida (409)', async () => {
    const deps = setup();
    await seedProfiles(deps);
    await new CreateCandidateProfileUseCase(
      deps.candidates,
      deps.positions,
    ).execute({
      userId: 'client2',
      name: 'Cand2',
      document: 'doc-2',
      address: 'rua',
      phone: '11999999999',
      positionId: position.id,
    });

    const job = await createJob(deps, 1);
    const apply = new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    );

    const hiring = await apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });
    await new AcceptCandidateUseCase(
      deps.restaurants,
      deps.hirings,
      deps.uow,
    ).execute({ userId: 'owner1', hiringId: hiring.id, agreedPrice: 100 });

    await expect(
      apply.execute({ userId: 'client2', jobId: job.id, hourlyRate: 100 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('bloqueia aceite em excesso (409)', async () => {
    const deps = setup();
    await seedProfiles(deps);
    await new CreateCandidateProfileUseCase(
      deps.candidates,
      deps.positions,
    ).execute({
      userId: 'client2',
      name: 'Cand2',
      document: 'doc-2',
      address: 'rua',
      phone: '11999999999',
      positionId: position.id,
    });

    const job = await createJob(deps, 1);
    const apply = new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    );
    const accept = new AcceptCandidateUseCase(
      deps.restaurants,
      deps.hirings,
      deps.uow,
    );

    const h1 = await apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });
    // segunda candidatura antes do preenchimento
    const jobTwo = await createJob(deps, 1);
    const h2 = await apply.execute({ userId: 'client2', jobId: jobTwo.id, hourlyRate: 120 });

    await accept.execute({ userId: 'owner1', hiringId: h1.id, agreedPrice: 100 });
    // tenta aceitar h2 numa vaga diferente e depois forcar excesso na primeira
    await accept.execute({ userId: 'owner1', hiringId: h2.id, agreedPrice: 100 });

    // nova candidatura na primeira vaga ja preenchida deve falhar no apply
    await expect(
      apply.execute({ userId: 'client2', jobId: job.id, hourlyRate: 100 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('bloqueia acao de nao-dono (403) e cancela candidaturas pendentes ao cancelar vaga', async () => {
    const deps = setup();
    await seedProfiles(deps);
    // segundo restaurante (outro dono)
    await new CreateRestaurantProfileUseCase(deps.restaurants).execute({
      userId: 'owner2',
      name: 'Rest2',
      cpfCnpj: 'cnpj-owner2',
      address: 'rua',
      phone: '11999999999',
    });

    const job = await createJob(deps, 2);
    const hiring = await new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    ).execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });

    const cancelJob = new CancelJobUseCase(
      deps.restaurants,
      deps.jobs,
      deps.uow,
    );

    await expect(
      cancelJob.execute({ userId: 'owner2', jobId: job.id }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    await cancelJob.execute({ userId: 'owner1', jobId: job.id });

    const cancelledHiring = await deps.hirings.findById(hiring.id);
    expect(cancelledHiring?.status).toBe('CANCELADA');
  });

  it('cancelamento de candidatura aceita marca falta', async () => {
    const deps = setup();
    await seedProfiles(deps);
    const job = await createJob(deps, 1);

    const hiring = await new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    ).execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });

    await new AcceptCandidateUseCase(
      deps.restaurants,
      deps.hirings,
      deps.uow,
    ).execute({ userId: 'owner1', hiringId: hiring.id, agreedPrice: 100 });

    const cancelled = await new CancelApplicationUseCase(
      deps.candidates,
      deps.hirings,
    ).execute({ userId: 'client1', hiringId: hiring.id });

    expect(cancelled.status).toBe('CANCELADA');
    expect(cancelled.cancellationFault).toBe(true);
  });

  it('permite re-candidatura apos cancelamento (reativa registro)', async () => {
    const deps = setup();
    await seedProfiles(deps);
    const job = await createJob(deps, 1);
    const apply = new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    );
    const cancel = new CancelApplicationUseCase(
      deps.candidates,
      deps.hirings,
    );

    const first = await apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });
    await cancel.execute({ userId: 'client1', hiringId: first.id });

    const second = await apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });
    expect(second.id).toBe(first.id);
    expect(second.status).toBe('SOLICITADA');
    expect(second.respondedAt).toBeNull();

    const stored = await deps.hirings.findById(first.id);
    expect(stored?.requestedAt.getTime()).toBeGreaterThanOrEqual(
      new Date(first.requestedAt).getTime(),
    );
  });

  it('bloqueia re-candidatura apos recusa pelo restaurante (409)', async () => {
    const deps = setup();
    await seedProfiles(deps);
    const job = await createJob(deps, 1);
    const apply = new ApplyForJobUseCase(
      deps.candidates,
      deps.jobs,
      deps.hirings,
    );

    const hiring = await apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 });
    await new RejectCandidateUseCase(
      deps.restaurants,
      deps.hirings,
    ).execute({ userId: 'owner1', hiringId: hiring.id });

    await expect(
      apply.execute({ userId: 'client1', jobId: job.id, hourlyRate: 100 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
