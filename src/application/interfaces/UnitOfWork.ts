import { CandidateRepository } from '../../domain/repositories/CandidateRepository';
import { HiringRepository } from '../../domain/repositories/HiringRepository';
import { JobRepository } from '../../domain/repositories/JobRepository';
import { RestaurantRepository } from '../../domain/repositories/RestaurantRepository';

/**
 * Repositorios ligados a uma mesma transacao. Usados em operacoes atomicas
 * multi-entidade (CancelJob, AcceptCandidate, FinishJob).
 */
export interface TransactionalContext {
  jobs: JobRepository;
  hirings: HiringRepository;
  candidates: CandidateRepository;
  restaurants: RestaurantRepository;
}

/**
 * Executa uma unidade de trabalho dentro de uma transacao. Em caso de erro,
 * toda a operacao e revertida.
 */
export interface UnitOfWork {
  execute<T>(work: (ctx: TransactionalContext) => Promise<T>): Promise<T>;
}
