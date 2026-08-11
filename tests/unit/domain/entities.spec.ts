import { Candidate } from '../../../src/domain/entities/Candidate';
import { Job } from '../../../src/domain/entities/Job';
import { Position } from '../../../src/domain/entities/Position';
import { Restaurant } from '../../../src/domain/entities/Restaurant';
import { Area } from '../../../src/domain/enums/Area';
import { JobStatus } from '../../../src/domain/enums/JobStatus';
import { InvalidStatusTransitionError } from '../../../src/domain/exceptions/InvalidStatusTransitionError';
import { JobSchedule } from '../../../src/domain/value-objects/JobSchedule';

const now = new Date('2030-01-01T00:00:00.000Z');
const schedule = JobSchedule.create(
  new Date('2030-06-15T18:00:00.000Z'),
  new Date('2030-06-15T23:00:00.000Z'),
  now,
);

describe('Restaurant entity', () => {
  it('atualiza todos os campos e faz soft delete', () => {
    const restaurant = Restaurant.create({
      userId: 'u',
      name: 'A',
      cpfCnpj: '1',
      address: 'x',
      phone: '9',
    });

    restaurant.update({
      name: 'B',
      address: 'y',
      phone: '8',
      requirementLevel: 4,
      bio: 'Restaurante familiar',
    });
    expect(restaurant.name).toBe('B');
    expect(restaurant.requirementLevel).toBe(4);
    expect(restaurant.bio).toBe('Restaurante familiar');

    expect(restaurant.isDeleted()).toBe(false);
    restaurant.softDelete();
    expect(restaurant.isDeleted()).toBe(true);
    expect(restaurant.active).toBe(false);
  });
});

describe('Candidate entity', () => {
  it('atualiza campos parciais e faz soft delete', () => {
    const candidate = Candidate.create({
      userId: 'u',
      name: 'A',
      document: 'd',
      address: 'x',
      phone: '9',
      positionId: 'p',
    });

    candidate.update({ name: 'B', bio: 'ola' });
    expect(candidate.name).toBe('B');
    expect(candidate.bio).toBe('ola');

    candidate.softDelete();
    expect(candidate.isDeleted()).toBe(true);
  });
});

describe('Job entity', () => {
  it('atualiza position, peopleCount e notes quando aberta', () => {
    const job = Job.create({
      restaurantId: 'r',
      positionId: 'p',
      schedule,
      peopleCount: 1,
    });

    job.update({ positionId: 'p2', peopleCount: 4, notes: 'obs' });
    expect(job.positionId).toBe('p2');
    expect(job.peopleCount).toBe(4);
    expect(job.notes).toBe('obs');
  });

  it('rejeita peopleCount < 1 na criacao e na atualizacao', () => {
    expect(() =>
      Job.create({
        restaurantId: 'r',
        positionId: 'p',
        schedule,
        peopleCount: 0,
      }),
    ).toThrow(InvalidStatusTransitionError);

    const job = Job.create({
      restaurantId: 'r',
      positionId: 'p',
      schedule,
      peopleCount: 1,
    });
    expect(() => job.update({ peopleCount: 0 })).toThrow(
      InvalidStatusTransitionError,
    );
  });

  it('nao reagenda quando concluida', () => {
    const job = Job.create({
      restaurantId: 'r',
      positionId: 'p',
      schedule,
      peopleCount: 1,
    });
    job.finish();
    expect(() => job.reschedule(schedule)).toThrow(
      InvalidStatusTransitionError,
    );
  });

  it('pode ser criada inativa quando solicitado', () => {
    const job = Job.create({
      restaurantId: 'r',
      positionId: 'p',
      schedule,
      peopleCount: 1,
      active: false,
    });

    expect(job.status).toBe(JobStatus.ABERTA);
    expect(job.active).toBe(false);
    expect(job.canReceiveApplications(new Date('2030-01-01T00:00:00.000Z'), 0)).toBe(
      false,
    );
  });

  it('softDelete marca deletedAt e inativa', () => {
    const job = Job.create({
      restaurantId: 'r',
      positionId: 'p',
      schedule,
      peopleCount: 1,
    });
    job.softDelete();
    expect(job.isDeleted()).toBe(true);
    expect(job.active).toBe(false);
  });
});

describe('Position entity', () => {
  it('expoe getters e isActive', () => {
    const position = Position.restore({
      id: 'p',
      area: Area.SALAO,
      name: 'Garcom',
      level: 1,
      active: true,
      createdAt: now,
    });

    expect(position.area).toBe(Area.SALAO);
    expect(position.name).toBe('Garcom');
    expect(position.level).toBe(1);
    expect(position.isActive()).toBe(true);
    expect(position.createdAt).toBe(now);
  });
});
