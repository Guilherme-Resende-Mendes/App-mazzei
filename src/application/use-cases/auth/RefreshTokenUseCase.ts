import { UserRepository } from '../../../domain/repositories/UserRepository';
import { RefreshTokenRepository } from '../../../domain/repositories/RefreshTokenRepository';
import { AUTH_MESSAGES } from '../../../shared/constants';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { AuthResultDTO, RefreshTokenInput } from '../../dto/auth.dto';
import { TokenProvider } from '../../interfaces/TokenProvider';
import { UserMapper } from '../../mappers/UserMapper';

/**
 * Rotaciona o refresh token: valida o atual, revoga-o e emite um novo par.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(input: RefreshTokenInput): Promise<AuthResultDTO> {
    const tokenHash = this.tokenProvider.hashRefreshToken(input.refreshToken);
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored || !stored.isActive()) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    await this.refreshTokenRepository.revokeById(stored.id);

    const user = await this.userRepository.findById(stored.userId);

    if (!user || !user.isActive()) {
      await this.refreshTokenRepository.revokeAllForUser(stored.userId);
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const accessToken = this.tokenProvider.signAccessToken({
      sub: user.id,
      role: user.role,
    });

    const refresh = this.tokenProvider.issueRefreshToken();

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refresh.expiresAt,
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
    };
  }
}
