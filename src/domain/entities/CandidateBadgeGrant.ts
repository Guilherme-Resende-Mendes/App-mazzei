export interface CandidateBadgeGrantProps {
  id: string;
  candidateId: string;
  restaurantId: string;
  hiringId: string;
  badgeSlug: string;
  grantedAt: Date;
}

export interface CreateCandidateBadgeGrantProps {
  id?: string;
  candidateId: string;
  restaurantId: string;
  hiringId: string;
  badgeSlug: string;
}

/**
 * Concessao de um selo pelo restaurante ao freelancer.
 * Ancorada numa contratacao concluida: o `hiringId` e a prova de que o trabalho
 * foi entregue e limita a concessao a um selo de cada tipo por trabalho.
 */
export class CandidateBadgeGrant {
  private constructor(private props: CandidateBadgeGrantProps) {}

  static create(
    props: CreateCandidateBadgeGrantProps,
    now: Date = new Date(),
  ): CandidateBadgeGrant {
    return new CandidateBadgeGrant({
      id: props.id ?? crypto.randomUUID(),
      candidateId: props.candidateId,
      restaurantId: props.restaurantId,
      hiringId: props.hiringId,
      badgeSlug: props.badgeSlug,
      grantedAt: now,
    });
  }

  static restore(props: CandidateBadgeGrantProps): CandidateBadgeGrant {
    return new CandidateBadgeGrant(props);
  }

  get id(): string {
    return this.props.id;
  }

  get candidateId(): string {
    return this.props.candidateId;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get hiringId(): string {
    return this.props.hiringId;
  }

  get badgeSlug(): string {
    return this.props.badgeSlug;
  }

  get grantedAt(): Date {
    return this.props.grantedAt;
  }

  isGrantedBy(restaurantId: string): boolean {
    return this.props.restaurantId === restaurantId;
  }
}
