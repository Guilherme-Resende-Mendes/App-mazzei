import type { Request, Response } from 'express';
import { Area } from '../../domain/enums/Area';
import { JobStatus } from '../../domain/enums/JobStatus';
import { ActivateJobUseCase } from '../../application/use-cases/jobs/ActivateJobUseCase';
import { CancelJobUseCase } from '../../application/use-cases/jobs/CancelJobUseCase';
import { CreateJobUseCase } from '../../application/use-cases/jobs/CreateJobUseCase';
import { DeactivateJobUseCase } from '../../application/use-cases/jobs/DeactivateJobUseCase';
import { DeleteJobUseCase } from '../../application/use-cases/jobs/DeleteJobUseCase';
import { FinishJobUseCase } from '../../application/use-cases/jobs/FinishJobUseCase';
import { GetJobUseCase } from '../../application/use-cases/jobs/GetJobUseCase';
import { ListOpenJobsUseCase } from '../../application/use-cases/jobs/ListOpenJobsUseCase';
import { ListRestaurantJobsUseCase } from '../../application/use-cases/jobs/ListRestaurantJobsUseCase';
import { RescheduleJobUseCase } from '../../application/use-cases/jobs/RescheduleJobUseCase';
import { UpdateJobUseCase } from '../../application/use-cases/jobs/UpdateJobUseCase';
import { sendSuccess } from '../../shared/utils/httpResponse';
import { getParam, getUserId } from '../utils/getUserId';

export class JobController {
  constructor(
    private readonly createJob: CreateJobUseCase,
    private readonly updateJob: UpdateJobUseCase,
    private readonly getJob: GetJobUseCase,
    private readonly listRestaurantJobs: ListRestaurantJobsUseCase,
    private readonly listOpenJobs: ListOpenJobsUseCase,
    private readonly activateJob: ActivateJobUseCase,
    private readonly deactivateJob: DeactivateJobUseCase,
    private readonly deleteJob: DeleteJobUseCase,
    private readonly cancelJob: CancelJobUseCase,
    private readonly finishJob: FinishJobUseCase,
    private readonly rescheduleJob: RescheduleJobUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.createJob.execute({
      userId: getUserId(req),
      positionId: req.body.positionId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      peopleCount: req.body.peopleCount,
      notes: req.body.notes ?? null,
      active: req.body.active,
    });

    return sendSuccess(res, result, 201);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.updateJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
      positionId: req.body.positionId,
      peopleCount: req.body.peopleCount,
      notes: req.body.notes,
    });

    return sendSuccess(res, result);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.getJob.execute(getParam(req, 'id'));
    return sendSuccess(res, result);
  };

  listMine = async (req: Request, res: Response): Promise<Response> => {
    const query = res.locals.query as {
      status?: JobStatus;
      active?: boolean;
      page?: number;
      perPage?: number;
    };

    const result = await this.listRestaurantJobs.execute({
      userId: getUserId(req),
      status: query.status,
      active: query.active,
      page: query.page,
      perPage: query.perPage,
    });

    return sendSuccess(res, result);
  };

  listOpen = async (_req: Request, res: Response): Promise<Response> => {
    const query = res.locals.query as {
      area?: Area;
      positionId?: string;
      fromStartDate?: string;
      page?: number;
      perPage?: number;
    };

    const result = await this.listOpenJobs.execute({
      area: query.area,
      positionId: query.positionId,
      fromStartDate: query.fromStartDate,
      page: query.page,
      perPage: query.perPage,
    });

    return sendSuccess(res, result);
  };

  activate = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.activateJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
    });

    return sendSuccess(res, result);
  };

  deactivate = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.deactivateJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
    });

    return sendSuccess(res, result);
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    await this.deleteJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
    });

    return sendSuccess(res, { message: 'Vaga removida com sucesso' });
  };

  cancel = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.cancelJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
    });

    return sendSuccess(res, result);
  };

  finish = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.finishJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
      evaluations: req.body.evaluations ?? [],
    });

    return sendSuccess(res, result);
  };

  reschedule = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.rescheduleJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    return sendSuccess(res, result);
  };
}
