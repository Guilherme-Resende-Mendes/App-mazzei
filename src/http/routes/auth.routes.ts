import { Router } from 'express';
import { container } from '../../config/container';
import { AuthController } from '../controllers/AuthController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validateRequest';
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from '../validators/auth.validators';

const authRoutes = Router();

const controller = (): AuthController => container.resolve(AuthController);

authRoutes.post(
  '/register',
  authRateLimiter,
  validateBody(registerBodySchema),
  (req, res) => controller().register(req, res),
);

authRoutes.post(
  '/login',
  authRateLimiter,
  validateBody(loginBodySchema),
  (req, res) => controller().login(req, res),
);

authRoutes.post(
  '/refresh',
  authRateLimiter,
  validateBody(refreshBodySchema),
  (req, res) => controller().refresh(req, res),
);

authRoutes.post('/logout', (req, res) => controller().logoutSession(req, res));

authRoutes.get('/me', ensureAuthenticated, (req, res) =>
  controller().profile(req, res),
);

export { authRoutes };
