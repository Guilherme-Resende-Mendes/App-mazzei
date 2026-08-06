import { JobRepository } from '../../../domain/repositories/JobRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { JobResponseDTO } from '../../dto/job.dto';
import { JobMapper } from '../../mappers/JobMapper';

export class GetJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(jobId: string): Promise<JobResponseDTO> {
    const job = await this.jobRepository.findById(jobId);

    if (!job || job.isDeleted()) {
      throw new NotFoundError('Vaga nao encontrada.');
    }

    return JobMapper.toResponse(job);
  }
}
