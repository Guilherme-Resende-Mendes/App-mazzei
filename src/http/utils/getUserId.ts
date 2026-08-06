import type { Request } from 'express';
import { AUTH_MESSAGES } from '../../shared/constants';
import { UnauthorizedError } from '../../shared/errors/AppError';

export function getUserId(req: Request): string {
  const userId = req.user?.sub;

  if (!userId) {
    throw new UnauthorizedError(AUTH_MESSAGES.MISSING_TOKEN);
  }

  return userId;
}

/** Le um parametro de rota como string (params podem ser string | string[]). */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}
