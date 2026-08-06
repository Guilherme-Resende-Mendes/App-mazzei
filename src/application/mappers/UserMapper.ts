import { User } from '../../domain/entities/User';
import { UserResponseDTO } from '../dto/auth.dto';

/**
 * Converte a entidade User em DTO publico.
 * Nunca expoe passwordHash / dados sensiveis.
 */
export class UserMapper {
  static toResponse(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email.value,
      role: user.role,
      active: user.active,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
