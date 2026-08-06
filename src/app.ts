import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { corsOrigins, env } from './config/env';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './http/middlewares/errorHandler';
import { globalRateLimiter } from './http/middlewares/rateLimiter';
import { routes } from './http/routes';
import { sendError } from './shared/utils/httpResponse';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use(globalRateLimiter);

  setupSwagger(app);

  app.use(env.API_PREFIX, routes);

  app.use((_req, res) => {
    sendError(res, 404, 'Rota nao encontrada');
  });

  app.use(errorHandler);

  return app;
}
