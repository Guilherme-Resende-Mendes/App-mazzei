import { Router } from 'express';
import { sendSuccess } from '../../shared/utils/httpResponse';
import { applicationRoutes } from './application.routes';
import { authRoutes } from './auth.routes';
import { candidateRoutes } from './candidate.routes';
import { jobRoutes } from './job.routes';
import { positionRoutes } from './position.routes';
import { restaurantRoutes } from './restaurant.routes';

const routes = Router();

routes.get('/health', (_req, res) =>
  sendSuccess(res, { status: 'ok', uptime: process.uptime() }),
);

routes.use('/auth', authRoutes);
routes.use('/restaurants', restaurantRoutes);
routes.use('/candidates', candidateRoutes);
routes.use('/positions', positionRoutes);
routes.use('/jobs', jobRoutes);
routes.use('/applications', applicationRoutes);

export { routes };
