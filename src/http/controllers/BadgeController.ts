import type { Request, Response } from 'express';
import { ListBadgesUseCase } from '../../application/use-cases/badges/ListBadgesUseCase';
import { sendSuccess } from '../../shared/utils/httpResponse';

export class BadgeController {
  constructor(private readonly listBadges: ListBadgesUseCase) {}

  list = async (_req: Request, res: Response): Promise<Response> => {
    const result = await this.listBadges.execute();
    return sendSuccess(res, result);
  };
}
