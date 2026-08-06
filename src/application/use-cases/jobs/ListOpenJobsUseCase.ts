import { JobRepository } from '../../../domain/repositories/JobRepository';
import { JobSchedule } from '../../../domain/value-objects/JobSchedule';
import { resolvePagination } from '../../../shared/utils/pagination';
import {
  JobResponseDTO,
  ListOpenJobsInput,
  PaginatedResponseDTO,
} from '../../dto/job.dto';
import { JobMapper } from '../../mappers/JobMapper';

export class ListOpenJobsUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(
    input: ListOpenJobsInput,
  ): Promise<PaginatedResponseDTO<JobResponseDTO>> {
    const pagination = resolvePagination(input.page, input.perPage);

    const result = await this.jobRepository.listOpen(
      {
        area: input.area,
        positionId: input.positionId,
        fromStartDate: input.fromStartDate
          ? JobSchedule.parseDateTimeString(input.fromStartDate)
          : undefined,
      },
      pagination,
    );

    return JobMapper.toPaginatedResponse(result);
  }
}
