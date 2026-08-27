import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { BadRequestError } from '../../shared/errors/AppError';

/**
 * Valida e sanitiza o corpo da requisicao contra um schema Zod.
 * Substitui req.body pelos dados ja validados (evita mass assignment).
 */
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      throw new BadRequestError('Dados invalidos', errors);
    }

    req.body = result.data;
    next();
  };
}

/**
 * Valida parametros de rota. Nao reescreve req.params (somente-leitura no
 * Express 5); serve para rejeitar valores fora do dominio antes do controller.
 */
export function validateParams(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      throw new BadRequestError('Parametros invalidos', errors);
    }

    next();
  };
}

/**
 * Valida a query string. Como req.query e somente-leitura no Express 5, o
 * resultado validado fica em res.locals.query.
 */
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      throw new BadRequestError('Parametros invalidos', errors);
    }

    res.locals.query = result.data;
    next();
  };
}
