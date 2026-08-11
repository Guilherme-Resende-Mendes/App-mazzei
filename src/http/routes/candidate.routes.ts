import { Router } from 'express';
import { container } from '../../config/container';
import { Role } from '../../domain/enums/Role';
import { CandidateController } from '../controllers/CandidateController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureRole } from '../middlewares/ensureRole';
import { validateBody } from '../middlewares/validateRequest';
import {
  createCandidateBodySchema,
  grantBadgeBodySchema,
  updateCandidateBodySchema,
} from '../validators/profile.validators';

const candidateRoutes = Router();

const controller = (): CandidateController =>
  container.resolve(CandidateController);

candidateRoutes.use(ensureAuthenticated);

candidateRoutes.post(
  '/',
  ensureRole(Role.CLIENT),
  validateBody(createCandidateBodySchema),
  (req, res) => controller().create(req, res),
);

candidateRoutes.get('/me', ensureRole(Role.CLIENT), (req, res) =>
  controller().me(req, res),
);

candidateRoutes.get('/me/reviews', ensureRole(Role.CLIENT), (req, res) =>
  controller().reviews(req, res),
);

candidateRoutes.get('/me/cpf', ensureRole(Role.CLIENT), (req, res) =>
  controller().myCpf(req, res),
);

candidateRoutes.get('/me/phone', ensureRole(Role.CLIENT), (req, res) =>
  controller().myPhone(req, res),
);

candidateRoutes.put(
  '/me',
  ensureRole(Role.CLIENT),
  validateBody(updateCandidateBodySchema),
  (req, res) => controller().update(req, res),
);

candidateRoutes.delete('/me', ensureRole(Role.CLIENT), (req, res) =>
  controller().remove(req, res),
);

candidateRoutes.get(
  '/:id',
  ensureRole(Role.OWNER),
  (req, res) => controller().getById(req, res),
);

candidateRoutes.post(
  '/:id/badges',
  ensureRole(Role.ADMIN),
  validateBody(grantBadgeBodySchema),
  (req, res) => controller().grant(req, res),
);

candidateRoutes.delete(
  '/:id/badges/:badge',
  ensureRole(Role.ADMIN),
  (req, res) => controller().revoke(req, res),
);

export { candidateRoutes };
