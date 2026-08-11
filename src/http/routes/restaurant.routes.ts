import { Router } from 'express';
import { container } from '../../config/container';
import { Role } from '../../domain/enums/Role';
import { RestaurantController } from '../controllers/RestaurantController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureRole } from '../middlewares/ensureRole';
import { validateBody } from '../middlewares/validateRequest';
import {
  createRestaurantBodySchema,
  updateRestaurantBodySchema,
} from '../validators/profile.validators';

const restaurantRoutes = Router();

const controller = (): RestaurantController =>
  container.resolve(RestaurantController);

restaurantRoutes.use(ensureAuthenticated, ensureRole(Role.OWNER));

restaurantRoutes.post(
  '/',
  validateBody(createRestaurantBodySchema),
  (req, res) => controller().create(req, res),
);

restaurantRoutes.get('/me', (req, res) => controller().me(req, res));

restaurantRoutes.get('/me/cpf-cnpj', (req, res) =>
  controller().myCpfCnpj(req, res),
);

restaurantRoutes.get('/me/phone', (req, res) =>
  controller().myPhone(req, res),
);

restaurantRoutes.put(
  '/me',
  validateBody(updateRestaurantBodySchema),
  (req, res) => controller().update(req, res),
);

restaurantRoutes.delete('/me', (req, res) => controller().remove(req, res));

export { restaurantRoutes };
