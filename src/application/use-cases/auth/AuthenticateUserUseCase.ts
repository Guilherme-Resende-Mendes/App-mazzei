import { UserRepository } from '../../../domain/repositories/UserRepository';
import { RefreshTokenRepository } from '../../../domain/repositories/RefreshTokenRepository';
import { AUTH_MESSAGES } from '../../../shared/constants';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../../shared/errors/AppError';
import { AuthResultDTO, LoginInput } from '../../dto/auth.dto';
import { HashProvider } from '../../interfaces/HashProvider';
import { TokenProvider } from '../../interfaces/TokenProvider';
import { UserMapper } from '../../mappers/UserMapper';

/**
 * Autentica um usuario por e-mail/senha e emite access + refresh token.
 */
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashProvider: HashProvider,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(input: LoginInput): Promise<AuthResultDTO> {
    const user = await this.userRepository.findByEmail(
      input.email.trim().toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatches = await this.hashProvider.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive()) {
      throw new ForbiddenError(AUTH_MESSAGES.USER_INACTIVE);
    }

    const now = new Date();
    user.registerLogin(now);
    await this.userRepository.updateLastLogin(user.id, now);

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
