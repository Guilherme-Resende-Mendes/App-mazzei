import { Router } from 'express';
import { container } from '../../config/container';
import { PositionController } from '../controllers/PositionController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validateQuery } from '../middlewares/validateRequest';
import { listPositionsQuerySchema } from '../validators/profile.validators';

const positionRoutes = Router();

const controller = (): PositionController =>
  container.resolve(PositionController);

positionRoutes.get(
  '/',
  ensureAuthenticated,
  validateQuery(listPositionsQuerySchema),
  (req, res) => controller().list(req, res),
);

export { positionRoutes };
