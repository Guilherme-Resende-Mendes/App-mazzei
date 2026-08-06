import {
  TransactionalContext,
  UnitOfWork,
} from '../../src/application/interfaces/UnitOfWork';

/**
 * UoW de teste: executa o trabalho contra os mesmos repositorios in-memory.
 * Nao simula rollback (suficiente para testar caminhos felizes e guardas que
 * lancam antes de mutar o estado).
 */
export class InMemoryUnitOfWork implements UnitOfWork {
  constructor(private readonly ctx: TransactionalContext) {}

  async execute<T>(
    work: (ctx: TransactionalContext) => Promise<T>,
  ): Promise<T> {
    return work(this.ctx);
  }
}
