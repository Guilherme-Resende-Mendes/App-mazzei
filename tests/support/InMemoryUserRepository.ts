import { User } from '../../src/domain/entities/User';
import { UserRepository } from '../../src/domain/repositories/UserRepository';

export class InMemoryUserRepository implements UserRepository {
  public readonly items: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.items.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.email.value === email) ?? null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.items.some((user) => user.email.value === email);
  }

  async create(user: User): Promise<User> {
    this.items.push(user);
    return user;
  }

  async updateLastLogin(userId: string, date: Date): Promise<void> {
    const user = this.items.find((item) => item.id === userId);
    user?.registerLogin(date);
  }
}
