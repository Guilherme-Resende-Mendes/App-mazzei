import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DomainException } from '../../domain/exceptions/DomainException';
import { isProduction } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { sendError } from '../../shared/utils/httpResponse';

/**
 * Middleware central de erros. Traduz erros conhecidos para o envelope padrao.
 * Deve ser registrado por ultimo na cadeia do Express.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, error.errors);
  }

  if (error instanceof ZodError) {
    const errors = error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    return sendError(res, 400, 'Dados invalidos', errors);
  }

  if (error instanceof DomainException) {
    return sendError(res, 422, error.message);
  }

  if (!isProduction) {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[UnhandledError]', error);
    return sendError(res, 500, 'Erro interno do servidor', [message]);
  }

  console.error('[UnhandledError]', error);
  return sendError(res, 500, 'Erro interno do servidor');
}
