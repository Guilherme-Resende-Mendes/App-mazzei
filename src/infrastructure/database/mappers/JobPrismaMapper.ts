import { Job } from '../../../domain/entities/Job';
import { JobSchedule } from '../../../domain/value-objects/JobSchedule';
import { Job as PrismaJob } from '../prisma/generated/client';
import { JobStatusMapper } from './JobStatusMapper';

export class JobPrismaMapper {
  static toDomain(row: PrismaJob): Job {
    return Job.restore({
      id: row.id,
      restaurantId: row.restaurantId,
      positionId: row.positionId,
      schedule: JobSchedule.restore(row.startDate, row.endDate),
      peopleCount: row.peopleCount,
      status: JobStatusMapper.toDomain(row.status),
      active: row.active,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
