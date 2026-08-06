import type { NextFunction, Request, Response } from 'express';
import { Role } from '../../domain/enums/Role';
import { AUTH_MESSAGES } from '../../shared/constants';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../shared/errors/AppError';

/**
 * Restringe o acesso a determinados perfis (RBAC).
 * Deve ser usado apos ensureAuthenticated.
 */
export function ensureRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError(AUTH_MESSAGES.MISSING_TOKEN);
    }

    if (req.user.role !== Role.ADMIN && !roles.includes(req.user.role)) {
      throw new ForbiddenError(AUTH_MESSAGES.FORBIDDEN_ROLE);
    }

    next();
  };
}
