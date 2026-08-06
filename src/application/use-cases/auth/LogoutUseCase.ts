import { RefreshTokenRepository } from '../../../domain/repositories/RefreshTokenRepository';
import { AUTH_MESSAGES } from '../../../shared/constants';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { LogoutInput } from '../../dto/auth.dto';
import { TokenProvider } from '../../interfaces/TokenProvider';

/**
 * Encerra a sessao revogando o refresh token informado.
 */
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    if (!input.refreshToken) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const tokenHash = this.tokenProvider.hashRefreshToken(input.refreshToken);
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored || !stored.isActive()) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    await this.refreshTokenRepository.revokeById(stored.id);
  }
}
