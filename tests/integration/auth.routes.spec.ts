import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../../src/app';
import { container } from '../../src/config/container';
import { TOKENS } from '../../src/config/tokens';
import { InMemoryRefreshTokenRepository } from '../support/InMemoryRefreshTokenRepository';
import { InMemoryUserRepository } from '../support/InMemoryUserRepository';

describe('Auth routes (integration)', () => {
  const base = '/api/auth';
  let app: Express;

  beforeAll(() => {
    container.registerInstance(
      TOKENS.UserRepository,
      new InMemoryUserRepository(),
    );
    container.registerInstance(
      TOKENS.RefreshTokenRepository,
      new InMemoryRefreshTokenRepository(),
    );
    app = createApp();
  });

  it('registra um novo usuario (201) sem expor dados sensiveis', async () => {
    const res = await request(app).post(`${base}/register`).send({
      email: 'a@example.com',
      password: 'supersecret',
      role: 'CLIENT',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('a@example.com');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('rejeita payload invalido (400) com lista de erros', async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ email: 'invalido', password: '123', role: 'CLIENT' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('bloqueia campos extras (mass assignment)', async () => {
    const res = await request(app).post(`${base}/register`).send({
      email: 'mass@example.com',
      password: 'supersecret',
      role: 'CLIENT',
      isAdmin: true,
    });

    expect(res.status).toBe(400);
  });

  it('rejeita e-mail duplicado (409)', async () => {
    await request(app).post(`${base}/register`).send({
      email: 'dup@example.com',
      password: 'supersecret',
      role: 'OWNER',
    });

    const res = await request(app).post(`${base}/register`).send({
      email: 'dup@example.com',
      password: 'supersecret',
      role: 'OWNER',
    });

    expect(res.status).toBe(409);
  });

  it('faz login e nao retorna o refresh token no corpo', async () => {
    await request(app).post(`${base}/register`).send({
      email: 'c@example.com',
      password: 'supersecret',
      role: 'CLIENT',
    });

    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: 'c@example.com', password: 'supersecret' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data).not.toHaveProperty('refreshToken');

    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
  });

  it('retorna o perfil autenticado e bloqueia acesso sem token', async () => {
    await request(app).post(`${base}/register`).send({
      email: 'me@example.com',
      password: 'supersecret',
      role: 'CLIENT',
    });

    const login = await request(app)
      .post(`${base}/login`)
      .send({ email: 'me@example.com', password: 'supersecret' });

    const token = login.body.data.accessToken as string;

    const authorized = await request(app)
      .get(`${base}/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(authorized.status).toBe(200);
    expect(authorized.body.data.email).toBe('me@example.com');

    const unauthorized = await request(app).get(`${base}/me`);
    expect(unauthorized.status).toBe(401);
  });

  it('rotaciona o refresh token via cookie e encerra a sessao', async () => {
    const agent = request.agent(app);

    await agent.post(`${base}/register`).send({
      email: 'flow@example.com',
      password: 'supersecret',
      role: 'CLIENT',
    });

    await agent
      .post(`${base}/login`)
      .send({ email: 'flow@example.com', password: 'supersecret' });

    const refreshed = await agent.post(`${base}/refresh`);
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toEqual(expect.any(String));

    const refreshedWithEmptyBody = await agent
      .post(`${base}/refresh`)
      .send({});
    expect(refreshedWithEmptyBody.status).toBe(200);
    expect(refreshedWithEmptyBody.body.data.accessToken).toEqual(
      expect.any(String),
    );

    const loggedOut = await agent.post(`${base}/logout`).send({});
    expect(loggedOut.status).toBe(200);
    expect(loggedOut.body.success).toBe(true);

    const loggedOutAgain = await agent.post(`${base}/logout`).send({});
    expect(loggedOutAgain.status).toBe(401);
    expect(loggedOutAgain.body.success).toBe(false);
  });
});
