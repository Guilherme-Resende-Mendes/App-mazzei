export interface RefreshTokenProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
}

/**
 * Refresh token persistido apenas como hash (nunca em texto puro).
 * Suporta rotacao (revokedAt) e expiracao (expiresAt).
 */
export class RefreshToken {
  private constructor(private props: RefreshTokenProps) {}

  static restore(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }

  isActive(now: Date = new Date()): boolean {
    return this.props.revokedAt === null && this.props.expiresAt > now;
  }
}
