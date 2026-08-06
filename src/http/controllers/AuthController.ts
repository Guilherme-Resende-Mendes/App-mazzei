import type { CookieOptions, Request, Response } from 'express';
import { Role } from '../../domain/enums/Role';
import { AuthResultDTO } from '../../application/dto/auth.dto';
import { AuthenticateUserUseCase } from '../../application/use-cases/auth/AuthenticateUserUseCase';
import { GetProfileUseCase } from '../../application/use-cases/auth/GetProfileUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { env, isProduction } from '../../config/env';
import { REFRESH_TOKEN_COOKIE } from '../../shared/constants';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { AUTH_MESSAGES } from '../../shared/constants';
import { sendSuccess } from '../../shared/utils/httpResponse';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly authenticateUser: AuthenticateUserUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
    private readonly getProfile: GetProfileUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.registerUser.execute({
      email: req.body.email,
      password: req.body.password,
      role: req.body.role as Role.CLIENT | Role.OWNER,
    });

    return sendSuccess(res, user, 201);
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authenticateUser.execute({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers['user-agent'] ?? null,
      ip: req.ip ?? null,
    });

    this.setRefreshCookie(res, result);

    // #region agent log
    fetch('http://127.0.0.1:7422/ingest/2a36f428-36c3-4dc5-b337-4e58842e281d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'08c322'},body:JSON.stringify({sessionId:'08c322',location:'AuthController.ts:login',message:'Login success - tokens issued',data:{hasAccessToken:!!result.accessToken,accessTokenLength:result.accessToken?.length??0,hasRefreshToken:!!result.refreshToken,refreshTokenLength:result.refreshToken?.length??0},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  refresh = async (req: Request, res: Response): Promise<Response> => {
    const token = this.extractRefreshToken(req);

    const result = await this.refreshToken.execute({
      refreshToken: token,
      userAgent: req.headers['user-agent'] ?? null,
      ip: req.ip ?? null,
    });

    this.setRefreshCookie(res, result);

    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  logoutSession = async (req: Request, res: Response): Promise<Response> => {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    try {
      await this.logout.execute({ refreshToken: token ?? '' });
    } finally {
      res.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieBaseOptions());
    }

    return sendSuccess(res, { message: 'Logout realizado com sucesso' });
  };

  profile = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError(AUTH_MESSAGES.MISSING_TOKEN);
    }

    const user = await this.getProfile.execute(userId);

    return sendSuccess(res, user);
  };

  private extractRefreshToken(req: Request): string {
    const fromCookie = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      string | undefined;
    const fromBody = req.body?.refreshToken as string | undefined;
    const token = fromCookie ?? fromBody;

    if (!token) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    return token;
  }

  private cookieBaseOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: `${env.API_PREFIX}/auth`,
    };
  }

  private setRefreshCookie(res: Response, result: AuthResultDTO): void {
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      ...this.cookieBaseOptions(),
      expires: result.refreshTokenExpiresAt,
    });
  }
}
