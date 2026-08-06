import { User } from '../../../domain/entities/User';
import { Role } from '../../../domain/enums/Role';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AUTH_MESSAGES } from '../../../shared/constants';
import { ConflictError, ForbiddenError } from '../../../shared/errors/AppError';
import { RegisterUserInput, UserResponseDTO } from '../../dto/auth.dto';
import { HashProvider } from '../../interfaces/HashProvider';
import { UserMapper } from '../../mappers/UserMapper';

/**
 * Cria uma identidade de autenticacao (client ou owner).
 * O perfil de negocio e completado em modulos proprios.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashProvider: HashProvider,
  ) {}

  async execute(input: RegisterUserInput): Promise<UserResponseDTO> {
    if (input.role !== Role.CLIENT && input.role !== Role.OWNER) {
      throw new ForbiddenError(AUTH_MESSAGES.FORBIDDEN_ROLE);
    }

    const alreadyExists = await this.userRepository.existsByEmail(
      input.email.trim().toLowerCase(),
    );

    if (alreadyExists) {
      throw new ConflictError(AUTH_MESSAGES.EMAIL_IN_USE);
    }

    const passwordHash = await this.hashProvider.hash(input.password);

    const user = User.create({
      email: input.email,
      passwordHash,
      role: input.role,
    });

    const created = await this.userRepository.create(user);

    return UserMapper.toResponse(created);
  }
}
