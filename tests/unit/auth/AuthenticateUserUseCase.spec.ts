import { AuthenticateUserUseCase } from '../../../src/application/use-cases/auth/AuthenticateUserUseCase';
import { User } from '../../../src/domain/entities/User';
import { Role } from '../../../src/domain/enums/Role';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../../src/shared/errors/AppError';
import { InMemoryUserRepository } from '../../support/InMemoryUserRepository';
import { InMemoryRefreshTokenRepository } from '../../support/InMemoryRefreshTokenRepository';
import { FakeHashProvider, FakeTokenProvider } from '../../support/fakes';

describe('AuthenticateUserUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let sut: AuthenticateUserUseCase;

  const seedUser = (overrides?: { active?: boolean }): User => {
    const user = User.create({
      email: 'user@example.com',
      passwordHash: 'hashed:secret123',
      role: Role.CLIENT,
    });
    if (overrides?.active === false) {
      user.registerLogin();
      // simula usuario inativo via restauracao
      return User.restore({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        active: false,
        lastLoginAt: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: null,
      });
    }
    return user;
  };

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    sut = new AuthenticateUserUseCase(
      userRepository,
      refreshTokenRepository,
      new FakeHashProvider(),
      new FakeTokenProvider(),
    );
  });

  it('autentica com credenciais validas e emite tokens', async () => {
    await userRepository.create(seedUser());

    const result = await sut.execute({
      email: 'user@example.com',
      password: 'secret123',
    });

    expect(result.accessToken).toContain('access.');
    expect(result.refreshToken).toBe('refresh-1');
    expect(refreshTokenRepository.items).toHaveLength(1);
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejeita e-mail inexistente', async () => {
    await expect(
      sut.execute({ email: 'missing@example.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejeita senha incorreta', async () => {
    await userRepository.create(seedUser());

    await expect(
      sut.execute({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejeita usuario inativo', async () => {
    await userRepository.create(seedUser({ active: false }));

    await expect(
      sut.execute({ email: 'user@example.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
