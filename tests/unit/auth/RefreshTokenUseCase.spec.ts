import { RefreshTokenUseCase } from '../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { User } from '../../../src/domain/entities/User';
import { Role } from '../../../src/domain/enums/Role';
import { UnauthorizedError } from '../../../src/shared/errors/AppError';
import { InMemoryUserRepository } from '../../support/InMemoryUserRepository';
import { InMemoryRefreshTokenRepository } from '../../support/InMemoryRefreshTokenRepository';
import { FakeTokenProvider } from '../../support/fakes';

describe('RefreshTokenUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let tokenProvider: FakeTokenProvider;
  let sut: RefreshTokenUseCase;
  let user: User;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenProvider = new FakeTokenProvider();
    sut = new RefreshTokenUseCase(
      userRepository,
      refreshTokenRepository,
      tokenProvider,
    );

    user = User.create({
      email: 'user@example.com',
      passwordHash: 'hashed:secret123',
      role: Role.CLIENT,
    });
    await userRepository.create(user);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokenProvider.hashRefreshToken('valid-token'),
      expiresAt: new Date(Date.now() + 60_000),
    });
  });

  it('rotaciona o refresh token: revoga o antigo e emite um novo', async () => {
    const result = await sut.execute({ refreshToken: 'valid-token' });

    expect(result.accessToken).toContain('access.');
    expect(result.refreshToken).not.toBe('valid-token');

    const oldRecord = refreshTokenRepository.items.find(
      (item) =>
        item.tokenHash === tokenProvider.hashRefreshToken('valid-token'),
    );
    expect(oldRecord?.revokedAt).not.toBeNull();
    expect(refreshTokenRepository.items).toHaveLength(2);
  });

  it('rejeita refresh token desconhecido', async () => {
    await expect(
      sut.execute({ refreshToken: 'unknown' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejeita refresh token ja revogado', async () => {
    await sut.execute({ refreshToken: 'valid-token' });

    await expect(
      sut.execute({ refreshToken: 'valid-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
