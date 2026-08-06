import { Hiring } from '../../src/domain/entities/Hiring';
import { HiringStatus } from '../../src/domain/enums/HiringStatus';
import { HiringRepository } from '../../src/domain/repositories/HiringRepository';

export class InMemoryHiringRepository implements HiringRepository {
  public readonly items: Hiring[] = [];

  async create(hiring: Hiring): Promise<Hiring> {
    this.items.push(hiring);
    return hiring;
  }

  async update(hiring: Hiring): Promise<Hiring> {
    const index = this.items.findIndex((item) => item.id === hiring.id);
    if (index >= 0) this.items[index] = hiring;
    return hiring;
  }

  async findById(id: string): Promise<Hiring | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByJobAndCandidate(
    jobId: string,
    candidateId: string,
  ): Promise<Hiring | null> {
    return (
      this.items.find(
        (item) => item.jobId === jobId && item.candidateId === candidateId,
      ) ?? null
    );
  }

  async listByJob(jobId: string): Promise<Hiring[]> {
    return this.items.filter((item) => item.jobId === jobId);
  }

  async listByCandidate(candidateId: string): Promise<Hiring[]> {
    return this.items.filter((item) => item.candidateId === candidateId);
  }

  async countByJobAndStatus(
    jobId: string,
    status: HiringStatus,
  ): Promise<number> {
    return this.items.filter(
      (item) => item.jobId === jobId && item.status === status,
    ).length;
  }

  async cancelPendingByJob(jobId: string, now: Date): Promise<void> {
    this.items
      .filter(
        (item) =>
          item.jobId === jobId && item.status === HiringStatus.SOLICITADA,
      )
      .forEach((item) => item.cancel(now));
  }
}
