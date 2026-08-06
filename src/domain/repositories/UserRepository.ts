import { User } from '../entities/User';

/**
 * Contrato de persistencia de usuarios (dominio).
 * A implementacao concreta vive na infraestrutura (PrismaUserRepository).
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  create(user: User): Promise<User>;
  updateLastLogin(userId: string, date: Date): Promise<void>;
}
