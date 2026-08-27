import { CandidateBadgeGrant } from '../entities/CandidateBadgeGrant';

export interface CandidateBadgeRepository {
  create(grant: CandidateBadgeGrant): Promise<CandidateBadgeGrant>;
  findByHiringAndBadge(
    hiringId: string,
    badgeSlug: string,
  ): Promise<CandidateBadgeGrant | null>;
  listByCandidate(candidateId: string): Promise<CandidateBadgeGrant[]>;
  listByHiring(hiringId: string): Promise<CandidateBadgeGrant[]>;
  delete(id: string): Promise<void>;
}
