import type { Request, Response } from 'express';
import { ensureRole } from '../../../src/http/middlewares/ensureRole';
import { Role } from '../../../src/domain/enums/Role';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../../src/shared/errors/AppError';

const res = {} as Response;

describe('ensureRole', () => {
  it('exige autenticacao previa', () => {
    const next = jest.fn();
    expect(() => ensureRole(Role.OWNER)({} as Request, res, next)).toThrow(
      UnauthorizedError,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('bloqueia perfil sem permissao', () => {
    const next = jest.fn();
    const req = { user: { sub: '1', role: Role.CLIENT } } as Request;
    expect(() => ensureRole(Role.OWNER)(req, res, next)).toThrow(
      ForbiddenError,
    );
  });

  it('permite o perfil autorizado', () => {
    const next = jest.fn();
    const req = { user: { sub: '1', role: Role.OWNER } } as Request;
    ensureRole(Role.OWNER)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('ADMIN acessa qualquer recurso', () => {
    const next = jest.fn();
    const req = { user: { sub: '1', role: Role.ADMIN } } as Request;
    ensureRole(Role.OWNER)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
