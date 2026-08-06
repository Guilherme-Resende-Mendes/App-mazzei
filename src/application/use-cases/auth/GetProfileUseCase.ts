import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AUTH_MESSAGES } from '../../../shared/constants';
import { NotFoundError } from '../../../shared/errors/AppError';
import { UserResponseDTO } from '../../dto/auth.dto';
import { UserMapper } from '../../mappers/UserMapper';

/**
 * Retorna o perfil (identidade) do usuario autenticado.
 */
export class GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    return UserMapper.toResponse(user);
  }
}
