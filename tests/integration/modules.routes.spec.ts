import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../../src/app';
import { container } from '../../src/config/container';
import { TOKENS } from '../../src/config/tokens';
import { Position } from '../../src/domain/entities/Position';
import { Area } from '../../src/domain/enums/Area';
import { Role } from '../../src/domain/enums/Role';
import { JwtTokenProvider } from '../../src/infrastructure/providers/auth/JwtTokenProvider';
import { TransactionalContext } from '../../src/application/interfaces/UnitOfWork';
import { InMemoryUserRepository } from '../support/InMemoryUserRepository';
import { InMemoryRefreshTokenRepository } from '../support/InMemoryRefreshTokenRepository';
import { InMemoryRestaurantRepository } from '../support/InMemoryRestaurantRepository';
import { InMemoryCandidateRepository } from '../support/InMemoryCandidateRepository';
import { InMemoryPositionRepository } from '../support/InMemoryPositionRepository';
import { InMemoryJobRepository } from '../support/InMemoryJobRepository';
import { InMemoryHiringRepository } from '../support/InMemoryHiringRepository';
import { InMemoryUnitOfWork } from '../support/InMemoryUnitOfWork';
import { FakeCepLookupProvider } from '../support/FakeCepLookupProvider';
import { validTestAddress } from '../support/validTestAddress';
import {
  VALID_CNPJ,
  VALID_CPF,
  VALID_PHONE,
  VALID_PHONE_2,
} from '../support/validTestDocuments';

const POSITION_ID = '11111111-1111-4111-8111-111111111111';

describe('Modules routes (integration)', () => {
  let app: Express;
  let ownerToken: string;
  let clientToken: string;
  let adminToken: string;
  let candidateId: string;

  const position = Position.restore({
    id: POSITION_ID,
    area: Area.COZINHA,
    name: 'Cozinheiro',
    level: 2,
    active: true,
    createdAt: new Date(),
  });

  beforeAll(async () => {
    const restaurants = new InMemoryRestaurantRepository();
    const candidates = new InMemoryCandidateRepository();
    const positions = new InMemoryPositionRepository([position]);
    const jobs = new InMemoryJobRepository();
    const hirings = new InMemoryHiringRepository();
    const ctx: TransactionalContext = {
      jobs,
      hirings,
      candidates,
      restaurants,
    };

    container.registerInstance(
      TOKENS.UserRepository,
      new InMemoryUserRepository(),
    );
    container.registerInstance(
      TOKENS.RefreshTokenRepository,
      new InMemoryRefreshTokenRepository(),
    );
    container.registerInstance(TOKENS.RestaurantRepository, restaurants);
    container.registerInstance(TOKENS.CandidateRepository, candidates);
    container.registerInstance(TOKENS.PositionRepository, positions);
    container.registerInstance(TOKENS.JobRepository, jobs);
    container.registerInstance(TOKENS.HiringRepository, hirings);
    container.registerInstance(TOKENS.UnitOfWork, new InMemoryUnitOfWork(ctx));
    container.registerInstance(
      TOKENS.CepLookupProvider,
      new FakeCepLookupProvider(),
    );

    app = createApp();

    await request(app).post('/api/auth/register').send({
      email: 'owner@example.com',
      password: 'supersecret',
      role: 'OWNER',
    });
    const ownerLogin = await request(app).post('/api/auth/login').send({
      email: 'owner@example.com',
      password: 'supersecret',
    });
    ownerToken = ownerLogin.body.data.accessToken;

    await request(app).post('/api/auth/register').send({
      email: 'client@example.com',
      password: 'supersecret',
      role: 'CLIENT',
    });
    const clientLogin = await request(app).post('/api/auth/login').send({
      email: 'client@example.com',
      password: 'supersecret',
    });
    clientToken = clientLogin.body.data.accessToken;

    adminToken = new JwtTokenProvider().signAccessToken({
      sub: 'admin-1',
      role: Role.ADMIN,
    });

    await request(app)
      .post('/api/restaurants')
      .set('Authorization', owner())
      .send({
        name: 'Cantina Setup',
        cpfCnpj: VALID_CNPJ,
        address: validTestAddress(),
        phone: VALID_PHONE,
      });

    await request(app)
      .post('/api/candidates')
      .set('Authorization', client())
      .send({
        name: 'Freelancer Setup',
        document: VALID_CPF,
        address: validTestAddress(),
        phone: VALID_PHONE_2,
        positionId: POSITION_ID,
      });
  });

  const owner = (): string => `Bearer ${ownerToken}`;
  const client = (): string => `Bearer ${clientToken}`;
  const admin = (): string => `Bearer ${adminToken}`;

  async function createJob(peopleCount = 1): Promise<string> {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', owner())
      .send({
        positionId: POSITION_ID,
        startDate: '15/06/2030 18:00',
        endDate: '15/06/2030 23:00',
        peopleCount,
      });
    return res.body.data.id as string;
  }

  it('permite criar vaga inativa (fechada para candidaturas)', async () => {
    const created = await request(app)
      .post('/api/jobs')
      .set('Authorization', owner())
      .send({
        positionId: POSITION_ID,
        startDate: '15/06/2030 18:00',
        endDate: '15/06/2030 23:00',
        peopleCount: 1,
        active: false,
      });

    expect(created.status).toBe(201);
    expect(created.body.data.active).toBe(false);
    expect(created.body.data.status).toBe('ABERTA');

    const apply = await request(app)
      .post(`/api/jobs/${created.body.data.id}/applications`)
      .set('Authorization', client())
      .send({ hourlyRate: 150 });

    expect(apply.status).toBe(409);
  });

  it('executa o fluxo completo de ponta a ponta', async () => {
    const candidate = await request(app)
      .get('/api/candidates/me')
      .set('Authorization', client());
    expect(candidate.status).toBe(200);
    candidateId = candidate.body.data.id;

    const job = await request(app)
      .post('/api/jobs')
      .set('Authorization', owner())
      .send({
        positionId: POSITION_ID,
        startDate: '15/06/2030 18:00',
        endDate: '15/06/2030 23:00',
        peopleCount: 1,
      });
    expect(job.status).toBe(201);
    const jobId = job.body.data.id as string;

    const open = await request(app)
      .get('/api/jobs')
      .set('Authorization', client());
    expect(open.status).toBe(200);
    expect(open.body.data.total).toBeGreaterThanOrEqual(1);

    const apply = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Authorization', client())
      .send({ hourlyRate: 150 });
    expect(apply.status).toBe(201);
    const hiringId = apply.body.data.id as string;

    const applyAgain = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Authorization', client())
      .send({ hourlyRate: 150 });
    expect(applyAgain.status).toBe(409);

    const listApps = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set('Authorization', owner());
    expect(listApps.status).toBe(200);
    expect(listApps.body.data).toHaveLength(1);

    const accept = await request(app)
      .post(`/api/applications/${hiringId}/accept`)
      .set('Authorization', owner())
      .send({ agreedPrice: 200 });
    expect(accept.status).toBe(200);
    expect(accept.body.data.status).toBe('ACEITA');

    const finish = await request(app)
      .post(`/api/jobs/${jobId}/finish`)
      .set('Authorization', owner())
      .send({
        evaluations: [{ hiringId, deliveryRating: 5, punctualityRating: 4 }],
      });
    expect(finish.status).toBe(200);
    expect(finish.body.data.status).toBe('CONCLUIDA');

    const reviews = await request(app)
      .get('/api/candidates/me/reviews')
      .set('Authorization', client());
    expect(reviews.status).toBe(200);
    expect(reviews.body.data).toHaveLength(1);
    expect(reviews.body.data[0].average).toBe(4.5);

    const me = await request(app)
      .get('/api/candidates/me')
      .set('Authorization', client());
    expect(me.body.data.overallRating).toBe(4.5);
  });

  it('le e atualiza perfis e lista o catalogo de cargos', async () => {
    const restaurantMe = await request(app)
      .get('/api/restaurants/me')
      .set('Authorization', owner());
    expect(restaurantMe.status).toBe(200);
    expect(restaurantMe.body.data.cpfCnpj).toBeUndefined();
    expect(restaurantMe.body.data.phone).toBeUndefined();

    const restaurantCpfCnpj = await request(app)
      .get('/api/restaurants/me/cpf-cnpj')
      .set('Authorization', owner());
    expect(restaurantCpfCnpj.status).toBe(200);
    expect(restaurantCpfCnpj.body.data.cpfCnpj).toBe(VALID_CNPJ);

    const restaurantPhone = await request(app)
      .get('/api/restaurants/me/phone')
      .set('Authorization', owner());
    expect(restaurantPhone.status).toBe(200);
    expect(restaurantPhone.body.data.phone).toBe(VALID_PHONE);

    const restaurantUpdate = await request(app)
      .put('/api/restaurants/me')
      .set('Authorization', owner())
      .send({
        name: 'Cantina Nova',
        requirementLevel: 3,
        bio: 'Especialidade em eventos corporativos',
      });
    expect(restaurantUpdate.status).toBe(200);
    expect(restaurantUpdate.body.data.name).toBe('Cantina Nova');
    expect(restaurantUpdate.body.data.bio).toBe(
      'Especialidade em eventos corporativos',
    );

    const candidateUpdate = await request(app)
      .put('/api/candidates/me')
      .set('Authorization', client())
      .send({ name: 'Freelancer Atualizado', bio: 'Experiencia em eventos' });
    expect(candidateUpdate.status).toBe(200);
    expect(candidateUpdate.body.data.name).toBe('Freelancer Atualizado');
    expect(candidateUpdate.body.data.bio).toBe('Experiencia em eventos');

    const candidateMe = await request(app)
      .get('/api/candidates/me')
      .set('Authorization', client());
    expect(candidateMe.body.data.document).toBeUndefined();
    expect(candidateMe.body.data.phone).toBeUndefined();

    const candidateCpf = await request(app)
      .get('/api/candidates/me/cpf')
      .set('Authorization', client());
    expect(candidateCpf.status).toBe(200);
    expect(candidateCpf.body.data.cpf).toBe(VALID_CPF);

    const candidatePhone = await request(app)
      .get('/api/candidates/me/phone')
      .set('Authorization', client());
    expect(candidatePhone.status).toBe(200);
    expect(candidatePhone.body.data.phone).toBe(VALID_PHONE_2);

    const candidateById = await request(app)
      .get(`/api/candidates/${candidateId}`)
      .set('Authorization', owner());
    expect(candidateById.status).toBe(200);
    expect(candidateById.body.data.document).toBeUndefined();
    expect(candidateById.body.data.phone).toBeUndefined();

    const ownerGetsClientCpf = await request(app)
      .get('/api/candidates/me/cpf')
      .set('Authorization', owner());
    expect(ownerGetsClientCpf.status).toBe(403);

    const positions = await request(app)
      .get('/api/positions')
      .set('Authorization', client());
    expect(positions.status).toBe(200);
    expect(positions.body.data.length).toBeGreaterThan(0);
  });

  it('percorre o ciclo de vida da vaga (update/activate/deactivate/reschedule/cancel/delete)', async () => {
    const jobId = await createJob(1);

    const get = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set('Authorization', client());
    expect(get.status).toBe(200);

    const update = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', owner())
      .send({ peopleCount: 3, notes: 'turno de sabado' });
    expect(update.status).toBe(200);
    expect(update.body.data.peopleCount).toBe(3);

    const deactivate = await request(app)
      .post(`/api/jobs/${jobId}/deactivate`)
      .set('Authorization', owner());
    expect(deactivate.status).toBe(200);
    expect(deactivate.body.data.active).toBe(false);

    const activate = await request(app)
      .post(`/api/jobs/${jobId}/activate`)
      .set('Authorization', owner());
    expect(activate.status).toBe(200);
    expect(activate.body.data.active).toBe(true);

    const reschedule = await request(app)
      .post(`/api/jobs/${jobId}/reschedule`)
      .set('Authorization', owner())
      .send({
        startDate: '20/07/2030 10:00',
        endDate: '20/07/2030 16:00',
      });
    expect(reschedule.status).toBe(200);
    expect(reschedule.body.data.startDate).toBe('20/07/2030 10:00');

    const mine = await request(app)
      .get('/api/jobs/mine')
      .set('Authorization', owner());
    expect(mine.status).toBe(200);
    expect(mine.body.data.total).toBeGreaterThan(0);

    const cancel = await request(app)
      .post(`/api/jobs/${jobId}/cancel`)
      .set('Authorization', owner());
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.status).toBe('CANCELADA');

    const toDelete = await createJob(1);
    const remove = await request(app)
      .delete(`/api/jobs/${toDelete}`)
      .set('Authorization', owner());
    expect(remove.status).toBe(200);
  });

  it('lista e gerencia candidaturas (mine/reject/cancel)', async () => {
    const jobId = await createJob(1);

    const apply = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Authorization', client())
      .send({ hourlyRate: 150 });
    expect(apply.status).toBe(201);
    const hiringId = apply.body.data.id as string;

    const mine = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', client());
    expect(mine.status).toBe(200);
    expect(mine.body.data.length).toBeGreaterThan(0);

    const reject = await request(app)
      .post(`/api/applications/${hiringId}/reject`)
      .set('Authorization', owner());
    expect(reject.status).toBe(200);
    expect(reject.body.data.status).toBe('RECUSADA');

    const jobId2 = await createJob(1);
    const apply2 = await request(app)
      .post(`/api/jobs/${jobId2}/applications`)
      .set('Authorization', client())
      .send({ hourlyRate: 150 });
    const hiringId2 = apply2.body.data.id as string;

    const cancel = await request(app)
      .post(`/api/applications/${hiringId2}/cancel`)
      .set('Authorization', client());
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.status).toBe('CANCELADA');

    const reapply = await request(app)
      .post(`/api/jobs/${jobId2}/applications`)
      .set('Authorization', client())
      .send({ hourlyRate: 180 });
    expect(reapply.status).toBe(201);
    expect(reapply.body.data.id).toBe(hiringId2);
    expect(reapply.body.data.status).toBe('SOLICITADA');
    expect(reapply.body.data.hourlyRate).toBe('180.00');
  });

  it('concede e revoga selos (ADMIN)', async () => {
    const grant = await request(app)
      .post(`/api/candidates/${candidateId}/badges`)
      .set('Authorization', admin())
      .send({ badge: 'PONTUAL' });
    expect(grant.status).toBe(201);
    expect(grant.body.data.badges).toHaveLength(1);

    const forbidden = await request(app)
      .post(`/api/candidates/${candidateId}/badges`)
      .set('Authorization', client())
      .send({ badge: 'FLEXIVEL' });
    expect(forbidden.status).toBe(403);

    const revoke = await request(app)
      .delete(`/api/candidates/${candidateId}/badges/PONTUAL`)
      .set('Authorization', admin());
    expect(revoke.status).toBe(200);
    expect(revoke.body.data.badges).toHaveLength(0);
  });

  it('aplica RBAC: cliente nao cria vaga (403) e owner nao se candidata (403)', async () => {
    const candidateId = (
      await request(app)
        .get('/api/candidates/me')
        .set('Authorization', client())
    ).body.data.id as string;

    const clientGetsCandidateById = await request(app)
      .get(`/api/candidates/${candidateId}`)
      .set('Authorization', client());
    expect(clientGetsCandidateById.status).toBe(403);

    const clientCreatesJob = await request(app)
      .post('/api/jobs')
      .set('Authorization', client())
      .send({
        positionId: POSITION_ID,
        startDate: '15/06/2030 18:00',
        endDate: '15/06/2030 23:00',
        peopleCount: 1,
      });
    expect(clientCreatesJob.status).toBe(403);

    const jobId = await createJob(1);
    const ownerApplies = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Authorization', owner())
      .send({ hourlyRate: 150 });
    expect(ownerApplies.status).toBe(403);
  });

  it('bloqueia acesso sem token (401)', async () => {
    const res = await request(app).get('/api/jobs/mine');
    expect(res.status).toBe(401);
  });

  it('remove (soft delete) perfis', async () => {
    const candidateRemoval = await request(app)
      .delete('/api/candidates/me')
      .set('Authorization', client());
    expect(candidateRemoval.status).toBe(200);

    const restaurantRemoval = await request(app)
      .delete('/api/restaurants/me')
      .set('Authorization', owner());
    expect(restaurantRemoval.status).toBe(200);
  });

  it('rejeita campos extras nos validators (400)', async () => {
    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', owner())
      .send({
        name: 'X',
        cpfCnpj: VALID_CNPJ,
        address: validTestAddress(),
        phone: VALID_PHONE,
        hacker: true,
      });
    expect(res.status).toBe(400);
  });
});
