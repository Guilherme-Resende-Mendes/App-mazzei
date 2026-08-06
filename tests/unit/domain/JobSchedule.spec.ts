import { JobSchedule } from '../../../src/domain/value-objects/JobSchedule';
import { InvalidJobScheduleError } from '../../../src/domain/exceptions/InvalidJobScheduleError';

describe('JobSchedule', () => {
  const now = new Date('2030-01-01T00:00:00.000Z');
  const futureStart = new Date('2030-06-15T18:00:00.000Z');
  const futureEnd = new Date('2030-06-15T23:00:00.000Z');

  it('formata e interpreta datetime no padrao DD/MM/AAAA HH:mm', () => {
    const parsed = JobSchedule.parseDateTimeString('15/06/2030 18:00');
    expect(JobSchedule.formatDateTime(parsed)).toBe('15/06/2030 18:00');
  });

  it('rejeita datetime invalido', () => {
    expect(() => JobSchedule.parseDateTimeString('31/02/2030 18:00')).toThrow(
      InvalidJobScheduleError,
    );
    expect(() => JobSchedule.parseDateTimeString('15/06/2030')).toThrow(
      InvalidJobScheduleError,
    );
    expect(() => JobSchedule.parseDateTimeString('2030-06-15 18:00')).toThrow(
      InvalidJobScheduleError,
    );
  });

  it('cria um agendamento futuro valido', () => {
    const schedule = JobSchedule.create(futureStart, futureEnd, now);
    expect(JobSchedule.formatDateTime(schedule.startAt)).toBe('15/06/2030 18:00');
    expect(JobSchedule.formatDateTime(schedule.endAt)).toBe('15/06/2030 23:00');
    expect(schedule.isPast(now)).toBe(false);
  });

  it('rejeita horario final menor ou igual ao inicial', () => {
    expect(() =>
      JobSchedule.create(futureStart, futureStart, now),
    ).toThrow(InvalidJobScheduleError);
    expect(() =>
      JobSchedule.create(
        new Date('2030-06-15T22:00:00.000Z'),
        new Date('2030-06-15T20:00:00.000Z'),
        now,
      ),
    ).toThrow(InvalidJobScheduleError);
  });

  it('rejeita agendamento no passado', () => {
    const pastStart = new Date('2020-01-01T18:00:00.000Z');
    const pastEnd = new Date('2020-01-01T23:00:00.000Z');
    expect(() => JobSchedule.create(pastStart, pastEnd, now)).toThrow(
      InvalidJobScheduleError,
    );
  });

  it('restore nao valida a regra de passado', () => {
    const schedule = JobSchedule.restore(
      new Date('2020-01-01T18:00:00.000Z'),
      new Date('2020-01-01T23:00:00.000Z'),
    );
    expect(schedule.isPast(now)).toBe(true);
  });
});
