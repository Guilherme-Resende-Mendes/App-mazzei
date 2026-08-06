import { InvalidJobScheduleError } from '../exceptions/InvalidJobScheduleError';

const DATETIME_REGEX = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;

/**
 * Agendamento de uma vaga: inicio e fim em UTC.
 * Invariantes: fim > inicio e inicio nao no passado.
 */
export class JobSchedule {
  private constructor(
    public readonly startAt: Date,
    public readonly endAt: Date,
  ) {}

  static create(
    startAt: Date,
    endAt: Date,
    now: Date = new Date(),
  ): JobSchedule {
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new InvalidJobScheduleError('data/horario invalido');
    }

    if (endAt.getTime() <= startAt.getTime()) {
      throw new InvalidJobScheduleError(
        'endDate deve ser maior que startDate',
      );
    }

    if (startAt.getTime() <= now.getTime()) {
      throw new InvalidJobScheduleError(
        'a vaga nao pode ser agendada no passado',
      );
    }

    return new JobSchedule(startAt, endAt);
  }

  /** Reconstrucao a partir da persistencia (sem validar regra de "nao passado"). */
  static restore(startAt: Date, endAt: Date): JobSchedule {
    return new JobSchedule(startAt, endAt);
  }

  isPast(now: Date = new Date()): boolean {
    return this.startAt.getTime() <= now.getTime();
  }

  static parseDateTimeString(value: string): Date {
    const match = value.match(DATETIME_REGEX);

    if (!match) {
      throw new InvalidJobScheduleError(
        'data/horario deve estar no formato DD/MM/AAAA HH:mm',
      );
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const hours = Number(match[4]);
    const minutes = Number(match[5]);
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day ||
      date.getUTCHours() !== hours ||
      date.getUTCMinutes() !== minutes
    ) {
      throw new InvalidJobScheduleError('data/horario invalido');
    }

    return date;
  }

  static formatDateTime(date: Date): string {
    return `${JobSchedule.formatDate(date)} ${JobSchedule.formatTime(date)}`;
  }

  private static formatDate(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  private static formatTime(date: Date): string {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }
}
