import { Job } from '../../../domain/entities/Job';
import {
  JobRepository,
  ListOpenJobsFilters,
  ListRestaurantJobsFilters,
} from '../../../domain/repositories/JobRepository';
import { JobStatus } from '../../../domain/enums/JobStatus';
import {
  buildPaginated,
  Paginated,
  PaginationParams,
  toSkip,
} from '../../../shared/utils/pagination';
import { PrismaClientOrTx } from '../prisma/client';
import { AreaMapper } from '../mappers/AreaMapper';
import { JobPrismaMapper } from '../mappers/JobPrismaMapper';
import { JobStatusMapper } from '../mappers/JobStatusMapper';
import { Prisma } from '../prisma/generated/client';

export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaClientOrTx) {}

  async create(job: Job): Promise<Job> {
    const row = await this.prisma.job.create({
      data: {
        id: job.id,
        restaurantId: job.restaurantId,
        positionId: job.positionId,
        startDate: job.schedule.startAt,
        endDate: job.schedule.endAt,
        peopleCount: job.peopleCount,
        status: JobStatusMapper.toPrisma(job.status),
        active: job.active,
        notes: job.notes,
      },
    });

    return JobPrismaMapper.toDomain(row);
  }

  async update(job: Job): Promise<Job> {
    const row = await this.prisma.job.update({
      where: { id: job.id },
      data: {
        positionId: job.positionId,
        startDate: job.schedule.startAt,
        endDate: job.schedule.endAt,
        peopleCount: job.peopleCount,
        status: JobStatusMapper.toPrisma(job.status),
        active: job.active,
        notes: job.notes,
      },
    });

    return JobPrismaMapper.toDomain(row);
  }

  async findById(id: string): Promise<Job | null> {
    const row = await this.prisma.job.findFirst({
      where: { id, deletedAt: null },
    });

    return row ? JobPrismaMapper.toDomain(row) : null;
  }

  async listByRestaurant(
    restaurantId: string,
    filters: ListRestaurantJobsFilters,
    pagination: PaginationParams,
  ): Promise<Paginated<Job>> {
    const where = {
      restaurantId,
      deletedAt: null,
      status: filters.status
        ? JobStatusMapper.toPrisma(filters.status)
        : undefined,
      active: filters.active,
    };

    const [rows, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: toSkip(pagination),
        take: pagination.perPage,
      }),
      this.prisma.job.count({ where }),
    ]);

    return buildPaginated(
      rows.map(JobPrismaMapper.toDomain),
      total,
      pagination,
    );
  }

  async listOpen(
    filters: ListOpenJobsFilters,
    pagination: PaginationParams,
  ): Promise<Paginated<Job>> {
    const where: Prisma.JobWhereInput = {
      deletedAt: null,
      active: true,
      status: JobStatusMapper.toPrisma(JobStatus.ABERTA),
      positionId: filters.positionId,
      position: filters.area
        ? { area: AreaMapper.toPrisma(filters.area) }
        : undefined,
      startDate: filters.fromStartDate
        ? { gte: filters.fromStartDate }
        : undefined,
    };

    const [rows, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip: toSkip(pagination),
        take: pagination.perPage,
      }),
      this.prisma.job.count({ where }),
    ]);

    return buildPaginated(
      rows.map(JobPrismaMapper.toDomain),
      total,
      pagination,
    );
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { deletedAt, active: false },
    });
  }
}
