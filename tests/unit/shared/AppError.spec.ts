import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../../src/shared/errors/AppError';

describe('AppError e subclasses', () => {
  it('usa mensagens e status padrao quando nao informados', () => {
    expect(new BadRequestError().statusCode).toBe(400);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new ConflictError().statusCode).toBe(409);
    expect(new UnprocessableEntityError().statusCode).toBe(422);

    expect(new BadRequestError().errors).toEqual([]);
    expect(new BadRequestError().message.length).toBeGreaterThan(0);
  });

  it('aceita mensagem e lista de erros customizadas', () => {
    const error = new BadRequestError('falhou', ['campo x']);
    expect(error.message).toBe('falhou');
    expect(error.errors).toEqual(['campo x']);
    expect(error.isOperational).toBe(true);
  });

  it('AppError base usa statusCode 400 por padrao', () => {
    const error = new AppError({ message: 'x' });
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual([]);
  });
});
