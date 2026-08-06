import type { Request, Response } from 'express';
import { AcceptCandidateUseCase } from '../../application/use-cases/applications/AcceptCandidateUseCase';
import { ApplyForJobUseCase } from '../../application/use-cases/applications/ApplyForJobUseCase';
import { CancelApplicationUseCase } from '../../application/use-cases/applications/CancelApplicationUseCase';
import { ListCandidateApplicationsUseCase } from '../../application/use-cases/applications/ListCandidateApplicationsUseCase';
import { ListJobApplicationsUseCase } from '../../application/use-cases/applications/ListJobApplicationsUseCase';
import { RejectCandidateUseCase } from '../../application/use-cases/applications/RejectCandidateUseCase';
import { sendSuccess } from '../../shared/utils/httpResponse';
import { getParam, getUserId } from '../utils/getUserId';

export class ApplicationController {
  constructor(
    private readonly applyForJob: ApplyForJobUseCase,
    private readonly cancelApplication: CancelApplicationUseCase,
    private readonly listCandidateApplications: ListCandidateApplicationsUseCase,
    private readonly listJobApplications: ListJobApplicationsUseCase,
    private readonly acceptCandidate: AcceptCandidateUseCase,
    private readonly rejectCandidate: RejectCandidateUseCase,
  ) {}

  apply = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.applyForJob.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
    });

    return sendSuccess(res, result, 201);
  };

  listForJob = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.listJobApplications.execute({
      userId: getUserId(req),
      jobId: getParam(req, 'id'),
    });

    return sendSuccess(res, result);
  };

  listMine = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.listCandidateApplications.execute({
      userId: getUserId(req),
    });

    return sendSuccess(res, result);
  };

  cancel = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.cancelApplication.execute({
      userId: getUserId(req),
      hiringId: getParam(req, 'id'),
    });

    return sendSuccess(res, result);
  };

  accept = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.acceptCandidate.execute({
      userId: getUserId(req),
      hiringId: getParam(req, 'id'),
      agreedPrice: req.body.agreedPrice,
    });

    return sendSuccess(res, result);
  };

  reject = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.rejectCandidate.execute({
      userId: getUserId(req),
      hiringId: getParam(req, 'id'),
    });

    return sendSuccess(res, result);
  };
}
