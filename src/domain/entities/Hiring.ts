import { HiringStatus } from '../enums/HiringStatus';
import { InvalidStatusTransitionError } from '../exceptions/InvalidStatusTransitionError';
import { Rating } from '../value-objects/Rating';
import { roundMoney } from '../../shared/utils/money';

export interface HiringProps {
  id: string;
  jobId: string;
  candidateId: string;
  restaurantId: string;
  agreedPrice: number | null;
  status: HiringStatus;
  requestedAt: Date;
  respondedAt: Date | null;
  deliveryRating: number | null;
  punctualityRating: number | null;
  cancellationFault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHiringProps {
  id?: string;
  jobId: string;
  candidateId: string;
  restaurantId: string;
  agreedPrice?: number | null;
}

/**
 * Contratacao/candidatura: liga um candidato a uma vaga e governa seu ciclo.
 */
export class Hiring {
  private constructor(private props: HiringProps) {}

  static create(props: CreateHiringProps, now: Date = new Date()): Hiring {
    return new Hiring({
      id: props.id ?? crypto.randomUUID(),
      jobId: props.jobId,
      candidateId: props.candidateId,
      restaurantId: props.restaurantId,
      agreedPrice: props.agreedPrice ?? null,
      status: HiringStatus.SOLICITADA,
      requestedAt: now,
      respondedAt: null,
      deliveryRating: null,
      punctualityRating: null,
      cancellationFault: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: HiringProps): Hiring {
    return new Hiring(props);
  }

  get id(): string {
    return this.props.id;
  }

  get jobId(): string {
    return this.props.jobId;
  }

  get candidateId(): string {
    return this.props.candidateId;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get agreedPrice(): number | null {
    return this.props.agreedPrice;
  }

  get status(): HiringStatus {
    return this.props.status;
  }

  get requestedAt(): Date {
    return this.props.requestedAt;
  }

  get respondedAt(): Date | null {
    return this.props.respondedAt;
  }

  get deliveryRating(): number | null {
    return this.props.deliveryRating;
  }

  get punctualityRating(): number | null {
    return this.props.punctualityRating;
  }

  get cancellationFault(): boolean {
    return this.props.cancellationFault;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isPending(): boolean {
    return this.props.status === HiringStatus.SOLICITADA;
  }

  isAccepted(): boolean {
    return this.props.status === HiringStatus.ACEITA;
  }

  isConcluded(): boolean {
    return this.props.status === HiringStatus.CONCLUIDA;
  }

  countsForRating(): boolean {
    return (
      this.props.status === HiringStatus.CONCLUIDA &&
      !this.props.cancellationFault &&
      this.props.deliveryRating !== null &&
      this.props.punctualityRating !== null
    );
  }

  accept(price: number | null | undefined, now: Date = new Date()): void {
    if (this.props.status !== HiringStatus.SOLICITADA) {
      throw new InvalidStatusTransitionError(
        'Hiring',
        this.props.status,
        'aceitar',
      );
    }
    if (price !== null && price !== undefined) {
      this.props.agreedPrice = roundMoney(price);
    }
    this.props.status = HiringStatus.ACEITA;
    this.props.respondedAt = now;
    this.props.updatedAt = now;
  }

  reject(now: Date = new Date()): void {
    if (this.props.status !== HiringStatus.SOLICITADA) {
      throw new InvalidStatusTransitionError(
        'Hiring',
        this.props.status,
        'recusar',
      );
    }
    this.props.status = HiringStatus.RECUSADA;
    this.props.respondedAt = now;
    this.props.updatedAt = now;
  }

  cancel(now: Date = new Date()): void {
    if (
      this.props.status !== HiringStatus.SOLICITADA &&
      this.props.status !== HiringStatus.ACEITA
    ) {
      throw new InvalidStatusTransitionError(
        'Hiring',
        this.props.status,
        'cancelar',
      );
    }
    if (this.props.status === HiringStatus.ACEITA) {
      this.props.cancellationFault = true;
    }
    this.props.status = HiringStatus.CANCELADA;
    this.props.respondedAt = now;
    this.props.updatedAt = now;
  }

  reapply(now: Date = new Date()): void {
    if (this.props.status !== HiringStatus.CANCELADA) {
      throw new InvalidStatusTransitionError(
        'Hiring',
        this.props.status,
        'recandidatar',
      );
    }
    this.props.status = HiringStatus.SOLICITADA;
    this.props.requestedAt = now;
    this.props.respondedAt = null;
    this.props.updatedAt = now;
  }

  conclude(
    delivery: Rating,
    punctuality: Rating,
    now: Date = new Date(),
  ): void {
    if (this.props.status !== HiringStatus.ACEITA) {
      throw new InvalidStatusTransitionError(
        'Hiring',
        this.props.status,
        'concluir',
      );
    }
    this.props.deliveryRating = delivery.toNumber();
    this.props.punctualityRating = punctuality.toNumber();
    this.props.status = HiringStatus.CONCLUIDA;
    this.props.updatedAt = now;
  }
}
