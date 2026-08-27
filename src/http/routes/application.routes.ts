import { Router } from 'express';
import { container } from '../../config/container';
import { Role } from '../../domain/enums/Role';
import { ApplicationController } from '../controllers/ApplicationController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureRole } from '../middlewares/ensureRole';
import { validateBody, validateParams } from '../middlewares/validateRequest';
import { acceptCandidateBodySchema } from '../validators/application.validators';
import {
  badgeParamsSchema,
  grantBadgeBodySchema,
} from '../validators/badge.validators';

const applicationRoutes = Router();

const controller = (): ApplicationController =>
  container.resolve(ApplicationController);

applicationRoutes.use(ensureAuthenticated);

applicationRoutes.get('/mine', ensureRole(Role.CLIENT), (req, res) =>
  controller().listMine(req, res),
);

applicationRoutes.post('/:id/cancel', ensureRole(Role.CLIENT), (req, res) =>
  controller().cancel(req, res),
);

applicationRoutes.post(
  '/:id/accept',
  ensureRole(Role.OWNER),
  validateBody(acceptCandidateBodySchema),
  (req, res) => controller().accept(req, res),
);

applicationRoutes.post('/:id/reject', ensureRole(Role.OWNER), (req, res) =>
  controller().reject(req, res),
);

// Selos: concedidos pelo restaurante sobre uma contratacao ja concluida.
applicationRoutes.get('/:id/badges', ensureRole(Role.OWNER), (req, res) =>
  controller().listBadges(req, res),
);

applicationRoutes.post(
  '/:id/badges',
  ensureRole(Role.OWNER),
  validateBody(grantBadgeBodySchema),
  (req, res) => controller().grantBadgeToCandidate(req, res),
);

applicationRoutes.delete(
  '/:id/badges/:badge',
  ensureRole(Role.OWNER),
  validateParams(badgeParamsSchema),
  (req, res) => controller().revokeBadgeFromCandidate(req, res),
);

export { applicationRoutes };
