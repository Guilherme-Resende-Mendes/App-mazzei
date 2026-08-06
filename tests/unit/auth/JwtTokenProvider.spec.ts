import { JwtTokenProvider } from '../../../src/infrastructure/providers/auth/JwtTokenProvider';
import { Role } from '../../../src/domain/enums/Role';
import { UnauthorizedError } from '../../../src/shared/errors/AppError';

describe('JwtTokenProvider', () => {
  const sut = new JwtTokenProvider();

  it('assina e verifica um access token valido', () => {
    const token = sut.signAccessToken({ sub: 'user-1', role: Role.CLIENT });
    const payload = sut.verifyAccessToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe(Role.CLIENT);
  });

  it('rejeita token invalido', () => {
    expect(() => sut.verifyAccessToken('nao-e-um-jwt')).toThrow(
      UnauthorizedError,
    );
  });

  it('gera refresh token opaco com hash e expiracao futura', () => {
    const bundle = sut.issueRefreshToken();

    expect(bundle.token).not.toBe(bundle.tokenHash);
    expect(bundle.tokenHash).toBe(sut.hashRefreshToken(bundle.token));
    expect(bundle.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
