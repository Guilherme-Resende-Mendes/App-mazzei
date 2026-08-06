import type { Request, Response } from 'express';
import { CreateRestaurantProfileUseCase } from '../../application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { DeleteRestaurantProfileUseCase } from '../../application/use-cases/profiles/DeleteRestaurantProfileUseCase';
import { GetRestaurantProfileUseCase } from '../../application/use-cases/profiles/GetRestaurantProfileUseCase';
import { UpdateRestaurantProfileUseCase } from '../../application/use-cases/profiles/UpdateRestaurantProfileUseCase';
import { sendSuccess } from '../../shared/utils/httpResponse';
import { getUserId } from '../utils/getUserId';

export class RestaurantController {
  constructor(
    private readonly createProfile: CreateRestaurantProfileUseCase,
    private readonly updateProfile: UpdateRestaurantProfileUseCase,
    private readonly getProfile: GetRestaurantProfileUseCase,
    private readonly deleteProfile: DeleteRestaurantProfileUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.createProfile.execute({
      userId: getUserId(req),
      name: req.body.name,
      cpfCnpj: req.body.cpfCnpj,
      address: req.body.address,
      phone: req.body.phone,
      requirementLevel: req.body.requirementLevel ?? null,
    });

    return sendSuccess(res, result, 201);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.updateProfile.execute({
      userId: getUserId(req),
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      requirementLevel: req.body.requirementLevel,
    });

    return sendSuccess(res, result);
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.getProfile.execute(getUserId(req));
    return sendSuccess(res, result);
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    await this.deleteProfile.execute(getUserId(req));
    return sendSuccess(res, { message: 'Perfil removido com sucesso' });
  };
}
