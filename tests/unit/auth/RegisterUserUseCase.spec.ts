import { RegisterUserUseCase } from '../../../src/application/use-cases/auth/RegisterUserUseCase';
import { Role } from '../../../src/domain/enums/Role';
import {
  ConflictError,
  ForbiddenError,
} from '../../../src/shared/errors/AppError';
import { InMemoryUserRepository } from '../../support/InMemoryUserRepository';
import { FakeHashProvider } from '../../support/fakes';

describe('RegisterUserUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let hashProvider: FakeHashProvider;
  let sut: RegisterUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashProvider = new FakeHashProvider();
    sut = new RegisterUserUseCase(userRepository, hashProvider);
  });

  it('cria um novo usuario client e normaliza o e-mail', async () => {
    const result = await sut.execute({
      email: 'Joao@Example.com ',
      password: 'supersecret',
      role: Role.CLIENT,
    });

    expect(result.email).toBe('joao@example.com');
    expect(result.role).toBe(Role.CLIENT);
    expect(userRepository.items).toHaveLength(1);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('armazena a senha com hash, nunca em texto puro', async () => {
    await sut.execute({
      email: 'owner@example.com',
      password: 'supersecret',
      role: Role.OWNER,
    });

    expect(userRepository.items[0].passwordHash).toBe('hashed:supersecret');
  });

  it('rejeita e-mail ja cadastrado', async () => {
    await sut.execute({
      email: 'dup@example.com',
      password: 'supersecret',
      role: Role.CLIENT,
    });

    await expect(
      sut.execute({
        email: 'dup@example.com',
        password: 'anothersecret',
        role: Role.CLIENT,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('nao permite auto-registro como ADMIN', async () => {
    await expect(
      sut.execute({
        email: 'admin@example.com',
        password: 'supersecret',
        role: Role.ADMIN as Role.CLIENT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
