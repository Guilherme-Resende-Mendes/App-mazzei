import { Hiring } from '../../../src/domain/entities/Hiring';
import { Job } from '../../../src/domain/entities/Job';
import { HiringStatus } from '../../../src/domain/enums/HiringStatus';
import { JobStatus } from '../../../src/domain/enums/JobStatus';
import { InvalidStatusTransitionError } from '../../../src/domain/exceptions/InvalidStatusTransitionError';
import { JobSchedule } from '../../../src/domain/value-objects/JobSchedule';
import { Rating } from '../../../src/domain/value-objects/Rating';

const now = new Date('2030-01-01T00:00:00.000Z');
const schedule = JobSchedule.create(
  new Date('2030-06-15T18:00:00.000Z'),
  new Date('2030-06-15T23:00:00.000Z'),
  now,
);

function newJob(peopleCount = 1): Job {
  return Job.create({
    restaurantId: 'rest',
    positionId: 'pos',
    schedule,
    peopleCount,
  });
}

describe('Job transitions', () => {
  it('aceita candidaturas quando aberta, ativa e com vagas', () => {
    const job = newJob(2);
    expect(job.canReceiveApplications(now, 0)).toBe(true);
    expect(job.canReceiveApplications(now, 2)).toBe(false);
  });

  it('nao aceita candidaturas quando desativada', () => {
    const job = newJob();
    job.deactivate();
    expect(job.canReceiveApplications(now, 0)).toBe(false);
  });

  it('markFilled so a partir de ABERTA', () => {
    const job = newJob();
    job.markFilled();
    expect(job.status).toBe(JobStatus.PREENCHIDA);
    expect(() => job.markFilled()).toThrow(InvalidStatusTransitionError);
  });

  it('nao cancela vaga ja concluida', () => {
    const job = newJob();
    job.finish();
    expect(job.status).toBe(JobStatus.CONCLUIDA);
    expect(() => job.cancel()).toThrow(InvalidStatusTransitionError);
  });
});

describe('Hiring transitions', () => {
  function newHiring(): Hiring {
    return Hiring.create({
      jobId: 'job',
      candidateId: 'cand',
      restaurantId: 'rest',
      hourlyRate: 50,
    });
  }

  it('aceita e conclui com notas', () => {
    const hiring = newHiring();
    hiring.accept(150);
    expect(hiring.status).toBe(HiringStatus.ACEITA);
    expect(hiring.agreedPrice).toBe(150);

    hiring.conclude(Rating.create(5), Rating.create(4));
    expect(hiring.status).toBe(HiringStatus.CONCLUIDA);
    expect(hiring.countsForRating()).toBe(true);
  });

  it('cancelar quando ACEITA marca falta', () => {
    const hiring = newHiring();
    hiring.accept(null);
    hiring.cancel();
    expect(hiring.status).toBe(HiringStatus.CANCELADA);
    expect(hiring.cancellationFault).toBe(true);
  });

  it('nao pode concluir sem estar ACEITA', () => {
    const hiring = newHiring();
    expect(() => hiring.conclude(Rating.create(5), Rating.create(5))).toThrow(
      InvalidStatusTransitionError,
    );
  });

  it('nao pode aceitar duas vezes', () => {
    const hiring = newHiring();
    hiring.accept(null);
    expect(() => hiring.accept(null)).toThrow(InvalidStatusTransitionError);
  });

  it('reapply so a partir de CANCELADA', () => {
    const hiring = newHiring();
    hiring.cancel();
    const reappliedAt = new Date('2030-02-01T00:00:00.000Z');
    hiring.reapply(75, reappliedAt);
    expect(hiring.status).toBe(HiringStatus.SOLICITADA);
    expect(hiring.hourlyRate).toBe(75);
    expect(hiring.requestedAt).toEqual(reappliedAt);
    expect(hiring.respondedAt).toBeNull();
  });

  it('nao pode reapply sem estar CANCELADA', () => {
    const hiring = newHiring();
    expect(() => hiring.reapply(75)).toThrow(InvalidStatusTransitionError);
  });
});
