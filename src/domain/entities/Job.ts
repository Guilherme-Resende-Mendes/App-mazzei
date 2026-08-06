import { JobStatus } from '../enums/JobStatus';
import { InvalidStatusTransitionError } from '../exceptions/InvalidStatusTransitionError';
import { JobSchedule } from '../value-objects/JobSchedule';

export interface JobProps {
  id: string;
  restaurantId: string;
  positionId: string;
  schedule: JobSchedule;
  peopleCount: number;
  status: JobStatus;
  active: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateJobProps {
  id?: string;
  restaurantId: string;
  positionId: string;
  schedule: JobSchedule;
  peopleCount: number;
  notes?: string | null;
  active?: boolean;
}

export interface UpdateJobProps {
  positionId?: string;
  peopleCount?: number;
  notes?: string | null;
}

/**
 * Vaga (turno) criada por um restaurante. Governa o ciclo de vida da contratacao.
 */
export class Job {
  private constructor(private props: JobProps) {}

  static create(props: CreateJobProps, now: Date = new Date()): Job {
    if (props.peopleCount < 1) {
      throw new InvalidStatusTransitionError(
        'Job',
        'ABERTA',
        'criar com qtd_pessoas < 1',
      );
    }

    return new Job({
      id: props.id ?? crypto.randomUUID(),
      restaurantId: props.restaurantId,
      positionId: props.positionId,
      schedule: props.schedule,
      peopleCount: props.peopleCount,
      status: JobStatus.ABERTA,
      active: props.active ?? true,
      notes: props.notes ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static restore(props: JobProps): Job {
    return new Job(props);
  }

  get id(): string {
    return this.props.id;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get positionId(): string {
    return this.props.positionId;
  }

  get schedule(): JobSchedule {
    return this.props.schedule;
  }

  get peopleCount(): number {
    return this.props.peopleCount;
  }

  get status(): JobStatus {
    return this.props.status;
  }

  get active(): boolean {
    return this.props.active;
  }

  get notes(): string | null {
    return this.props.notes;
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

  isOwnedBy(restaurantId: string): boolean {
    return this.props.restaurantId === restaurantId;
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  canReceiveApplications(now: Date, acceptedCount: number): boolean {
    return (
      this.props.status === JobStatus.ABERTA &&
      this.props.active &&
      this.props.deletedAt === null &&
      !this.props.schedule.isPast(now) &&
      acceptedCount < this.props.peopleCount
    );
  }

  update(changes: UpdateJobProps, now: Date = new Date()): void {
    this.assertEditable('editar');
    if (changes.positionId !== undefined) {
      this.props.positionId = changes.positionId;
    }
    if (changes.peopleCount !== undefined) {
      if (changes.peopleCount < 1) {
        throw new InvalidStatusTransitionError(
          'Job',
          this.props.status,
          'definir qtd_pessoas < 1',
        );
      }
      this.props.peopleCount = changes.peopleCount;
    }
    if (changes.notes !== undefined) this.props.notes = changes.notes;
    this.props.updatedAt = now;
  }

  reschedule(schedule: JobSchedule, now: Date = new Date()): void {
    if (
      this.props.status !== JobStatus.ABERTA &&
      this.props.status !== JobStatus.PREENCHIDA
    ) {
      throw new InvalidStatusTransitionError(
        'Job',
        this.props.status,
        'reagendar',
      );
    }
    this.props.schedule = schedule;
    this.props.updatedAt = now;
  }

  activate(now: Date = new Date()): void {
    this.assertEditable('ativar');
    this.props.active = true;
    this.props.updatedAt = now;
  }

  deactivate(now: Date = new Date()): void {
    this.assertEditable('desativar');
    this.props.active = false;
    this.props.updatedAt = now;
  }

  markFilled(now: Date = new Date()): void {
    if (this.props.status !== JobStatus.ABERTA) {
      throw new InvalidStatusTransitionError(
        'Job',
        this.props.status,
        'marcar como preenchida',
      );
    }
    this.props.status = JobStatus.PREENCHIDA;
    this.props.updatedAt = now;
  }

  cancel(now: Date = new Date()): void {
    if (
      this.props.status === JobStatus.CANCELADA ||
      this.props.status === JobStatus.CONCLUIDA
    ) {
      throw new InvalidStatusTransitionError(
        'Job',
        this.props.status,
        'cancelar',
      );
    }
    this.props.status = JobStatus.CANCELADA;
    this.props.updatedAt = now;
  }

  finish(now: Date = new Date()): void {
    if (
      this.props.status !== JobStatus.ABERTA &&
      this.props.status !== JobStatus.PREENCHIDA
    ) {
      throw new InvalidStatusTransitionError(
        'Job',
        this.props.status,
        'concluir',
      );
    }
    this.props.status = JobStatus.CONCLUIDA;
    this.props.updatedAt = now;
  }

  softDelete(now: Date = new Date()): void {
    this.props.deletedAt = now;
    this.props.active = false;
    this.props.updatedAt = now;
  }

  private assertEditable(action: string): void {
    if (this.props.status !== JobStatus.ABERTA) {
      throw new InvalidStatusTransitionError('Job', this.props.status, action);
    }
  }
}
