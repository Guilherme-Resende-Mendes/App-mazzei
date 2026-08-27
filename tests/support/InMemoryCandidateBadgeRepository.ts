import { CandidateBadgeGrant } from '../../src/domain/entities/CandidateBadgeGrant';
import { CandidateBadgeRepository } from '../../src/domain/repositories/CandidateBadgeRepository';

export class InMemoryCandidateBadgeRepository implements CandidateBadgeRepository {
  public readonly items: CandidateBadgeGrant[] = [];

  async create(grant: CandidateBadgeGrant): Promise<CandidateBadgeGrant> {
    this.items.push(grant);
    return grant;
  }

  async findByHiringAndBadge(
    hiringId: string,
    badgeSlug: string,
  ): Promise<CandidateBadgeGrant | null> {
    return (
      this.items.find(
        (item) => item.hiringId === hiringId && item.badgeSlug === badgeSlug,
      ) ?? null
    );
  }

  async listByCandidate(candidateId: string): Promise<CandidateBadgeGrant[]> {
    return this.items.filter((item) => item.candidateId === candidateId);
  }

  async listByHiring(hiringId: string): Promise<CandidateBadgeGrant[]> {
    return this.items.filter((item) => item.hiringId === hiringId);
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) this.items.splice(index, 1);
  }
}
