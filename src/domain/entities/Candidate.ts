import { Rating } from '../value-objects/Rating';
import { Address } from '../value-objects/Address';

export interface CandidateProps {
  id: string;
  userId: string;
  name: string;
  document: string;
  address: Address;
  phone: string;
  positionId: string;
  overallRating: number;
  bio: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateCandidateProps {
  id?: string;
  userId: string;
  name: string;
  document: string;
  address: Address;
  phone: string;
  positionId: string;
  bio?: string | null;
}

export interface UpdateCandidateProps {
  name?: string;
  address?: Address;
  phone?: string;
  positionId?: string;
  bio?: string | null;
}

/**
 * Perfil de candidato/freelancer (papel CLIENT, 1:1 com usuario).
 * nota_geral (overallRating) e materializada e recalculada ao concluir vagas.
 */
export class Candidate {
  private constructor(private props: CandidateProps) {}

  static create(
    props: CreateCandidateProps,
    now: Date = new Date(),
  ): Candidate {
    return new Candidate({
      id: props.id ?? crypto.randomUUID(),
      userId: props.userId,
      name: props.name,
      document: props.document,
      address: props.address,
      phone: props.phone,
      positionId: props.positionId,
      overallRating: 0,
      bio: props.bio ?? null,
      active: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static restore(props: CandidateProps): Candidate {
    return new Candidate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get document(): string {
    return this.props.document;
  }

  get address(): Address {
    return this.props.address;
  }

  get phone(): string {
    return this.props.phone;
  }

  get positionId(): string {
    return this.props.positionId;
  }

  get overallRating(): number {
    return this.props.overallRating;
  }

  get bio(): string | null {
    return this.props.bio;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  update(changes: UpdateCandidateProps, now: Date = new Date()): void {
    if (changes.name !== undefined) this.props.name = changes.name;
    if (changes.address !== undefined) this.props.address = changes.address;
    if (changes.phone !== undefined) this.props.phone = changes.phone;
    if (changes.positionId !== undefined) {
      this.props.positionId = changes.positionId;
    }
    if (changes.bio !== undefined) this.props.bio = changes.bio;
    this.props.updatedAt = now;
  }

  applyRating(rating: Rating, now: Date = new Date()): void {
    this.props.overallRating = rating.toNumber();
    this.props.updatedAt = now;
  }

  softDelete(now: Date = new Date()): void {
    this.props.deletedAt = now;
    this.props.active = false;
    this.props.updatedAt = now;
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }
}
