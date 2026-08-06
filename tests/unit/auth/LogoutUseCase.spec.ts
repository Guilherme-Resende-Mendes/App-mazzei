import { LogoutUseCase } from '../../../src/application/use-cases/auth/LogoutUseCase';
import { InMemoryRefreshTokenRepository } from '../../support/InMemoryRefreshTokenRepository';
import { FakeTokenProvider } from '../../support/fakes';

describe('LogoutUseCase', () => {
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let tokenProvider: FakeTokenProvider;
  let sut: LogoutUseCase;

  beforeEach(() => {
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenProvider = new FakeTokenProvider();
    sut = new LogoutUseCase(refreshTokenRepository, tokenProvider);
  });

  it('revoga o refresh token informado', async () => {
    await refreshTokenRepository.create({
      userId: 'user-1',
      tokenHash: tokenProvider.hashRefreshToken('token'),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await sut.execute({ refreshToken: 'token' });

    expect(refreshTokenRepository.items[0].revokedAt).not.toBeNull();
  });

  it('rejeita logout sem sessao ativa', async () => {
    await expect(sut.execute({ refreshToken: '' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('rejeita logout com token inexistente ou ja revogado', async () => {
    await expect(sut.execute({ refreshToken: 'invalid' })).rejects.toMatchObject(
      {
        statusCode: 401,
      },
    );

    await refreshTokenRepository.create({
      userId: 'user-1',
      tokenHash: tokenProvider.hashRefreshToken('revoked'),
      expiresAt: new Date(Date.now() + 60_000),
    });
    refreshTokenRepository.items[0].revokedAt = new Date();

    await expect(
      sut.execute({ refreshToken: 'revoked' }),
    ).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
