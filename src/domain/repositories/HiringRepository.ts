import { Hiring } from '../entities/Hiring';
import { HiringStatus } from '../enums/HiringStatus';

export interface HiringRepository {
  create(hiring: Hiring): Promise<Hiring>;
  update(hiring: Hiring): Promise<Hiring>;
  findById(id: string): Promise<Hiring | null>;
  findByJobAndCandidate(
    jobId: string,
    candidateId: string,
  ): Promise<Hiring | null>;
  listByJob(jobId: string): Promise<Hiring[]>;
  listByCandidate(candidateId: string): Promise<Hiring[]>;
  countByJobAndStatus(jobId: string, status: HiringStatus): Promise<number>;
  cancelPendingByJob(jobId: string, now: Date): Promise<void>;
}
