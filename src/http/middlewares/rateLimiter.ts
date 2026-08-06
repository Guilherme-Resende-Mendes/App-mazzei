import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

/**
 * Limite global de requisicoes por IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisicoes. Tente novamente mais tarde.',
    errors: [],
  },
});

/**
 * Limite mais restritivo para endpoints sensiveis de autenticacao.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.max(5, Math.floor(env.RATE_LIMIT_MAX / 5)),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente mais tarde.',
    errors: [],
  },
});
