import { Router } from 'express';
import { container } from '../../config/container';
import { BadgeController } from '../controllers/BadgeController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const badgeRoutes = Router();

const controller = (): BadgeController => container.resolve(BadgeController);

badgeRoutes.get('/', ensureAuthenticated, (req, res) =>
  controller().list(req, res),
);

export { badgeRoutes };
