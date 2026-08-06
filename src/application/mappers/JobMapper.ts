import { Job } from '../../domain/entities/Job';
import { JobSchedule } from '../../domain/value-objects/JobSchedule';
import { Paginated } from '../../shared/utils/pagination';
import { JobResponseDTO, PaginatedResponseDTO } from '../dto/job.dto';

export class JobMapper {
  static toResponse(job: Job): JobResponseDTO {
    return {
      id: job.id,
      restaurantId: job.restaurantId,
      positionId: job.positionId,
      startDate: JobSchedule.formatDateTime(job.schedule.startAt),
      endDate: JobSchedule.formatDateTime(job.schedule.endAt),
      peopleCount: job.peopleCount,
      status: job.status,
      active: job.active,
      notes: job.notes,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }

  static toPaginatedResponse(
    paginated: Paginated<Job>,
  ): PaginatedResponseDTO<JobResponseDTO> {
    return {
      items: paginated.items.map(JobMapper.toResponse),
      total: paginated.total,
      page: paginated.page,
      perPage: paginated.perPage,
      totalPages: paginated.totalPages,
    };
  }
}
