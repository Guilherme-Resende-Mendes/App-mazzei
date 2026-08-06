import { Role } from '../../domain/enums/Role';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export interface RefreshTokenBundle {
  /** Token opaco em texto puro (enviado ao cliente, nunca persistido). */
  token: string;
  /** Hash do token, unico valor persistido. */
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Abstracao de emissao/verificacao de tokens.
 * Access token: JWT assinado. Refresh token: opaco, guardado como hash.
 */
export interface TokenProvider {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  issueRefreshToken(): RefreshTokenBundle;
  hashRefreshToken(token: string): string;
}
