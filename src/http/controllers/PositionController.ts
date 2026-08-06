import type { Request, Response } from 'express';
import { Area } from '../../domain/enums/Area';
import { ListPositionsUseCase } from '../../application/use-cases/profiles/ListPositionsUseCase';
import { sendSuccess } from '../../shared/utils/httpResponse';

export class PositionController {
  constructor(private readonly listPositions: ListPositionsUseCase) {}

  list = async (_req: Request, res: Response): Promise<Response> => {
    const query = res.locals.query as { area?: Area };
    const result = await this.listPositions.execute({ area: query.area });
    return sendSuccess(res, result);
  };
}
