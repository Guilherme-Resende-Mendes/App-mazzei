import type { Request, Response } from 'express';
import { Badge } from '../../domain/enums/Badge';
import { CreateCandidateProfileUseCase } from '../../application/use-cases/profiles/CreateCandidateProfileUseCase';
import { DeleteCandidateProfileUseCase } from '../../application/use-cases/profiles/DeleteCandidateProfileUseCase';
import { GetCandidateOwnCpfUseCase } from '../../application/use-cases/profiles/GetCandidateOwnCpfUseCase';
import { GetCandidateOwnPhoneUseCase } from '../../application/use-cases/profiles/GetCandidateOwnPhoneUseCase';
import { GetCandidateProfileUseCase } from '../../application/use-cases/profiles/GetCandidateProfileUseCase';
import { GrantCandidateBadgeUseCase } from '../../application/use-cases/profiles/GrantCandidateBadgeUseCase';
import { RevokeCandidateBadgeUseCase } from '../../application/use-cases/profiles/RevokeCandidateBadgeUseCase';
import { UpdateCandidateProfileUseCase } from '../../application/use-cases/profiles/UpdateCandidateProfileUseCase';
import { ListCandidateReviewsUseCase } from '../../application/use-cases/reviews/ListCandidateReviewsUseCase';
import { sendSuccess } from '../../shared/utils/httpResponse';
import { getParam, getUserId } from '../utils/getUserId';

export class CandidateController {
  constructor(
    private readonly createProfile: CreateCandidateProfileUseCase,
    private readonly updateProfile: UpdateCandidateProfileUseCase,
    private readonly getProfile: GetCandidateProfileUseCase,
    private readonly getOwnCpf: GetCandidateOwnCpfUseCase,
    private readonly getOwnPhone: GetCandidateOwnPhoneUseCase,
    private readonly deleteProfile: DeleteCandidateProfileUseCase,
    private readonly grantBadge: GrantCandidateBadgeUseCase,
    private readonly revokeBadge: RevokeCandidateBadgeUseCase,
    private readonly listReviews: ListCandidateReviewsUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.createProfile.execute({
      userId: getUserId(req),
      name: req.body.name,
      document: req.body.document,
      address: req.body.address,
      phone: req.body.phone,
      positionId: req.body.positionId,
      bio: req.body.bio ?? null,
    });

    return sendSuccess(res, result, 201);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.updateProfile.execute({
      userId: getUserId(req),
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      positionId: req.body.positionId,
      bio: req.body.bio,
    });

    return sendSuccess(res, result);
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.getProfile.executeByUserId(getUserId(req));
    return sendSuccess(res, result);
  };

  myCpf = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.getOwnCpf.execute(getUserId(req));
    return sendSuccess(res, result);
  };

  myPhone = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.getOwnPhone.execute(getUserId(req));
    return sendSuccess(res, result);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.getProfile.executeById(getParam(req, 'id'));
    return sendSuccess(res, result);
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    await this.deleteProfile.execute(getUserId(req));
    return sendSuccess(res, { message: 'Perfil removido com sucesso' });
  };

  grant = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.grantBadge.execute({
      candidateId: getParam(req, 'id'),
      badge: req.body.badge as Badge,
    });

    return sendSuccess(res, result, 201);
  };

  revoke = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.revokeBadge.execute({
      candidateId: getParam(req, 'id'),
      badge: getParam(req, 'badge') as Badge,
    });

    return sendSuccess(res, result);
  };

  reviews = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.listReviews.execute(getUserId(req));
    return sendSuccess(res, result);
  };
}
