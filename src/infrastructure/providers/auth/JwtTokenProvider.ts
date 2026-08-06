import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import {
  AccessTokenPayload,
  RefreshTokenBundle,
  TokenProvider,
} from '../../../application/interfaces/TokenProvider';
import { isRole } from '../../../domain/enums/Role';
import { env } from '../../../config/env';
import { AUTH_MESSAGES } from '../../../shared/constants';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { parseDurationToMs } from '../../../shared/utils/duration';

export class JwtTokenProvider implements TokenProvider {
  private readonly accessExpiresInSeconds = Math.floor(
    parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN) / 1000,
  );

  private readonly refreshExpiresInMs = parseDurationToMs(
    env.JWT_REFRESH_EXPIRES_IN,
  );

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign({ role: payload.role }, env.JWT_ACCESS_SECRET, {
      subject: payload.sub,
      expiresIn: this.accessExpiresInSeconds,
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

      if (
        typeof decoded === 'string' ||
        typeof decoded.sub !== 'string' ||
        typeof decoded.role !== 'string' ||
        !isRole(decoded.role)
      ) {
        throw new UnauthorizedError(AUTH_MESSAGES.INVALID_TOKEN);
      }

      return { sub: decoded.sub, role: decoded.role };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_TOKEN);
    }
  }

  issueRefreshToken(): RefreshTokenBundle {
    const token = randomBytes(48).toString('hex');
    const tokenHash = this.hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + this.refreshExpiresInMs);

    return { token, tokenHash, expiresAt };
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
