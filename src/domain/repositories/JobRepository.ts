import { Job } from '../entities/Job';
import { Area } from '../enums/Area';
import { JobStatus } from '../enums/JobStatus';
import { Paginated, PaginationParams } from '../../shared/utils/pagination';

export interface ListRestaurantJobsFilters {
  status?: JobStatus;
  active?: boolean;
}

export interface ListOpenJobsFilters {
  area?: Area;
  positionId?: string;
  fromStartDate?: Date;
}

export interface JobRepository {
  create(job: Job): Promise<Job>;
  update(job: Job): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  listByRestaurant(
    restaurantId: string,
    filters: ListRestaurantJobsFilters,
    pagination: PaginationParams,
  ): Promise<Paginated<Job>>;
  listOpen(
    filters: ListOpenJobsFilters,
    pagination: PaginationParams,
  ): Promise<Paginated<Job>>;
  softDelete(id: string, deletedAt: Date): Promise<void>;
}
