import { GetProfileUseCase } from '../../../src/application/use-cases/auth/GetProfileUseCase';
import { User } from '../../../src/domain/entities/User';
import { Role } from '../../../src/domain/enums/Role';
import { NotFoundError } from '../../../src/shared/errors/AppError';
import { InMemoryUserRepository } from '../../support/InMemoryUserRepository';

describe('GetProfileUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetProfileUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetProfileUseCase(userRepository);
  });

  it('retorna o perfil do usuario', async () => {
    const user = User.create({
      email: 'profile@example.com',
      passwordHash: 'hashed:secret123',
      role: Role.OWNER,
    });
    await userRepository.create(user);

    const result = await sut.execute(user.id);

    expect(result.id).toBe(user.id);
    expect(result.email).toBe('profile@example.com');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('lanca NotFound quando o usuario nao existe', async () => {
    await expect(sut.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
