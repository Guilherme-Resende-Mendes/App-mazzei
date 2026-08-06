import { Candidate } from '../entities/Candidate';
import { Badge } from '../enums/Badge';

export interface CandidateRepository {
  create(candidate: Candidate): Promise<Candidate>;
  update(candidate: Candidate): Promise<Candidate>;
  findById(id: string): Promise<Candidate | null>;
  findByUserId(userId: string): Promise<Candidate | null>;
  existsByDocument(document: string): Promise<boolean>;
  updateOverallRating(id: string, rating: number): Promise<void>;
  addBadge(candidateId: string, badge: Badge, grantedAt: Date): Promise<void>;
  removeBadge(candidateId: string, badge: Badge): Promise<void>;
  softDelete(id: string, deletedAt: Date): Promise<void>;
}
