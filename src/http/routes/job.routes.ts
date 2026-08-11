import { Router } from 'express';
import { container } from '../../config/container';
import { Role } from '../../domain/enums/Role';
import { ApplicationController } from '../controllers/ApplicationController';
import { JobController } from '../controllers/JobController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureRole } from '../middlewares/ensureRole';
import { validateBody, validateQuery } from '../middlewares/validateRequest';
import {
  createJobBodySchema,
  finishJobBodySchema,
  listOpenJobsQuerySchema,
  listRestaurantJobsQuerySchema,
  rescheduleJobBodySchema,
  updateJobBodySchema,
} from '../validators/job.validators';
import { applyForJobBodySchema } from '../validators/application.validators';

const jobRoutes = Router();

const jobController = (): JobController => container.resolve(JobController);
const applicationController = (): ApplicationController =>
  container.resolve(ApplicationController);

jobRoutes.use(ensureAuthenticated);

jobRoutes.get('/', validateQuery(listOpenJobsQuerySchema), (req, res) =>
  jobController().listOpen(req, res),
);

jobRoutes.get(
  '/mine',
  ensureRole(Role.OWNER),
  validateQuery(listRestaurantJobsQuerySchema),
  (req, res) => jobController().listMine(req, res),
);

jobRoutes.post(
  '/',
  ensureRole(Role.OWNER),
  validateBody(createJobBodySchema),
  (req, res) => jobController().create(req, res),
);

jobRoutes.get('/:id', (req, res) => jobController().getById(req, res));

jobRoutes.put(
  '/:id',
  ensureRole(Role.OWNER),
  validateBody(updateJobBodySchema),
  (req, res) => jobController().update(req, res),
);

jobRoutes.delete('/:id', ensureRole(Role.OWNER), (req, res) =>
  jobController().remove(req, res),
);

jobRoutes.post('/:id/activate', ensureRole(Role.OWNER), (req, res) =>
  jobController().activate(req, res),
);

jobRoutes.post('/:id/deactivate', ensureRole(Role.OWNER), (req, res) =>
  jobController().deactivate(req, res),
);

jobRoutes.post('/:id/cancel', ensureRole(Role.OWNER), (req, res) =>
  jobController().cancel(req, res),
);

jobRoutes.post(
  '/:id/finish',
  ensureRole(Role.OWNER),
  validateBody(finishJobBodySchema),
  (req, res) => jobController().finish(req, res),
);

jobRoutes.post(
  '/:id/reschedule',
  ensureRole(Role.OWNER),
  validateBody(rescheduleJobBodySchema),
  (req, res) => jobController().reschedule(req, res),
);

jobRoutes.post(
  '/:id/applications',
  ensureRole(Role.CLIENT),
  validateBody(applyForJobBodySchema),
  (req, res) => applicationController().apply(req, res),
);

jobRoutes.get('/:id/applications', ensureRole(Role.OWNER), (req, res) =>
  applicationController().listForJob(req, res),
);

export { jobRoutes };
