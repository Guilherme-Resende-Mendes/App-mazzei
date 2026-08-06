import {
  TransactionalContext,
  UnitOfWork,
} from '../../application/interfaces/UnitOfWork';
import { Database } from './prisma/client';
import { PrismaCandidateRepository } from './repositories/PrismaCandidateRepository';
import { PrismaHiringRepository } from './repositories/PrismaHiringRepository';
import { PrismaJobRepository } from './repositories/PrismaJobRepository';
import { PrismaRestaurantRepository } from './repositories/PrismaRestaurantRepository';

/**
 * Unit of Work sobre prisma.$transaction: instancia repositorios ligados ao
 * client transacional. Qualquer erro reverte a transacao inteira.
 */
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: Database) {}

  execute<T>(work: (ctx: TransactionalContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => {
      const ctx: TransactionalContext = {
        jobs: new PrismaJobRepository(tx),
        hirings: new PrismaHiringRepository(tx),
        candidates: new PrismaCandidateRepository(tx),
        restaurants: new PrismaRestaurantRepository(tx),
      };

      return work(ctx);
    });
  }
}
