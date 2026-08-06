import { HashProvider } from '../../src/application/interfaces/HashProvider';
import {
  AccessTokenPayload,
  RefreshTokenBundle,
  TokenProvider,
} from '../../src/application/interfaces/TokenProvider';
import { Role, isRole } from '../../src/domain/enums/Role';

export class FakeHashProvider implements HashProvider {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

export class FakeTokenProvider implements TokenProvider {
  private counter = 0;

  signAccessToken(payload: AccessTokenPayload): string {
    return `access.${payload.sub}.${payload.role}`;
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const [, sub, role] = token.split('.');
    if (!sub || !role || !isRole(role)) {
      throw new Error('invalid token');
    }
    return { sub, role: role as Role };
  }

  issueRefreshToken(): RefreshTokenBundle {
    this.counter += 1;
    const token = `refresh-${this.counter}`;
    return {
      token,
      tokenHash: this.hashRefreshToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }

  hashRefreshToken(token: string): string {
    return `h:${token}`;
  }
}
