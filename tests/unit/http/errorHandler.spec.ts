import type { Request, Response } from 'express';
import { z } from 'zod';
import { errorHandler } from '../../../src/http/middlewares/errorHandler';
import { InvalidEmailError } from '../../../src/domain/exceptions/InvalidEmailError';
import {
  ConflictError,
  UnauthorizedError,
} from '../../../src/shared/errors/AppError';

interface MockResponse extends Response {
  status: jest.Mock;
  json: jest.Mock;
}

function mockResponse(): MockResponse {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const req = {} as Request;
const next = jest.fn();

describe('errorHandler', () => {
  it('mapeia AppError para o statusCode e envelope corretos', () => {
    const res = mockResponse();

    errorHandler(new ConflictError('conflito', ['x']), req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'conflito',
      errors: ['x'],
    });
  });

  it('mapeia UnauthorizedError para 401', () => {
    const res = mockResponse();
    errorHandler(new UnauthorizedError(), req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('mapeia ZodError para 400', () => {
    const res = mockResponse();
    const parsed = z.object({ name: z.string() }).safeParse({});

    if (parsed.success) {
      throw new Error('esperado erro de validacao');
    }

    errorHandler(parsed.error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('mapeia DomainException para 422', () => {
    const res = mockResponse();
    errorHandler(new InvalidEmailError('x'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('mapeia erro desconhecido para 500', () => {
    const res = mockResponse();
    const spy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    errorHandler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    spy.mockRestore();
  });
});
