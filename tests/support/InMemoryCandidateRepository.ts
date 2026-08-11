import { Candidate } from '../../src/domain/entities/Candidate';
import { Badge } from '../../src/domain/enums/Badge';
import { CandidateRepository } from '../../src/domain/repositories/CandidateRepository';
import { Rating } from '../../src/domain/value-objects/Rating';

export class InMemoryCandidateRepository implements CandidateRepository {
  public readonly items: Candidate[] = [];

  async create(candidate: Candidate): Promise<Candidate> {
    this.items.push(candidate);
    return candidate;
  }

  async update(candidate: Candidate): Promise<Candidate> {
    const index = this.items.findIndex((item) => item.id === candidate.id);
    if (index >= 0) this.items[index] = candidate;
    return candidate;
  }

  async findById(id: string): Promise<Candidate | null> {
    return (
      this.items.find((item) => item.id === id && !item.isDeleted()) ?? null
    );
  }

  async findByUserId(userId: string): Promise<Candidate | null> {
    return (
      this.items.find((item) => item.userId === userId && !item.isDeleted()) ??
      null
    );
  }

  async existsByDocument(document: string): Promise<boolean> {
    return this.items.some((item) => item.document === document);
  }

  async updateOverallRating(id: string, rating: number): Promise<void> {
    const candidate = this.items.find((item) => item.id === id);
    candidate?.applyRating(Rating.create(rating));
  }

  async addBadge(
    candidateId: string,
    badge: Badge,
    grantedAt: Date,
  ): Promise<void> {
    const candidate = this.items.find((item) => item.id === candidateId);
    if (!candidate) return;

    const index = this.items.indexOf(candidate);
    this.items[index] = Candidate.restore({
      id: candidate.id,
      userId: candidate.userId,
      name: candidate.name,
      document: candidate.document,
      address: candidate.address,
      phone: candidate.phone,
      positionId: candidate.positionId,
      overallRating: candidate.overallRating,
      bio: candidate.bio,
      badges: [...candidate.badges, { badge, grantedAt }],
      active: candidate.active,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      deletedAt: candidate.deletedAt,
    });
  }

  async removeBadge(candidateId: string, badge: Badge): Promise<void> {
    const candidate = this.items.find((item) => item.id === candidateId);
    if (!candidate) return;

    const index = this.items.indexOf(candidate);
    this.items[index] = Candidate.restore({
      id: candidate.id,
      userId: candidate.userId,
      name: candidate.name,
      document: candidate.document,
      address: candidate.address,
      phone: candidate.phone,
      positionId: candidate.positionId,
      overallRating: candidate.overallRating,
      bio: candidate.bio,
      badges: candidate.badges.filter((item) => item.badge !== badge),
      active: candidate.active,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      deletedAt: candidate.deletedAt,
    });
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    const candidate = this.items.find((item) => item.id === id);
    candidate?.softDelete(deletedAt);
  }
}
