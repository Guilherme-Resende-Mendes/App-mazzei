import { Job } from '../../src/domain/entities/Job';
import { JobStatus } from '../../src/domain/enums/JobStatus';
import {
  JobRepository,
  ListOpenJobsFilters,
  ListRestaurantJobsFilters,
} from '../../src/domain/repositories/JobRepository';
import {
  buildPaginated,
  Paginated,
  PaginationParams,
  toSkip,
} from '../../src/shared/utils/pagination';

export class InMemoryJobRepository implements JobRepository {
  public readonly items: Job[] = [];

  async create(job: Job): Promise<Job> {
    this.items.push(job);
    return job;
  }

  async update(job: Job): Promise<Job> {
    const index = this.items.findIndex((item) => item.id === job.id);
    if (index >= 0) this.items[index] = job;
    return job;
  }

  async findById(id: string): Promise<Job | null> {
    return (
      this.items.find((item) => item.id === id && !item.isDeleted()) ?? null
    );
  }

  async listByRestaurant(
    restaurantId: string,
    filters: ListRestaurantJobsFilters,
    pagination: PaginationParams,
  ): Promise<Paginated<Job>> {
    const filtered = this.items.filter(
      (job) =>
        job.restaurantId === restaurantId &&
        !job.isDeleted() &&
        (filters.status === undefined || job.status === filters.status) &&
        (filters.active === undefined || job.active === filters.active),
    );

    return this.paginate(filtered, pagination);
  }

  async listOpen(
    filters: ListOpenJobsFilters,
    pagination: PaginationParams,
  ): Promise<Paginated<Job>> {
    const filtered = this.items.filter(
      (job) =>
        !job.isDeleted() &&
        job.active &&
        job.status === JobStatus.ABERTA &&
        (filters.positionId === undefined ||
          job.positionId === filters.positionId) &&
        (filters.fromStartDate === undefined ||
          job.schedule.startAt.getTime() >= filters.fromStartDate.getTime()),
    );

    return this.paginate(filtered, pagination);
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    const job = this.items.find((item) => item.id === id);
    job?.softDelete(deletedAt);
  }

  private paginate(jobs: Job[], pagination: PaginationParams): Paginated<Job> {
    const skip = toSkip(pagination);
    const page = jobs.slice(skip, skip + pagination.perPage);
    return buildPaginated(page, jobs.length, pagination);
  }
}
