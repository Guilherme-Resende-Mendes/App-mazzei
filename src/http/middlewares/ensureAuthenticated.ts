import type { NextFunction, Request, Response } from 'express';
import { TokenProvider } from '../../application/interfaces/TokenProvider';
import { container } from '../../config/container';
import { TOKENS } from '../../config/tokens';
import { AUTH_MESSAGES } from '../../shared/constants';
import { UnauthorizedError } from '../../shared/errors/AppError';

/**
 * Valida o access token (Bearer) e injeta o usuario autenticado em req.user.
 */
export function ensureAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  // #region agent log
  fetch('http://127.0.0.1:7422/ingest/2a36f428-36c3-4dc5-b337-4e58842e281d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'08c322'},body:JSON.stringify({sessionId:'08c322',location:'ensureAuthenticated.ts:entry',message:'Auth check on protected route',data:{path:req.path,hasAuthorization:!!header,authPrefix:header?.slice(0,7)??null,hasRefreshCookie:!!req.cookies?.refreshToken,cookieKeys:Object.keys(req.cookies??{})},timestamp:Date.now(),hypothesisId:'A-B-C-D'})}).catch(()=>{});
  // #endregion

  if (!header || !header.startsWith('Bearer ')) {
    // #region agent log
    fetch('http://127.0.0.1:7422/ingest/2a36f428-36c3-4dc5-b337-4e58842e281d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'08c322'},body:JSON.stringify({sessionId:'08c322',location:'ensureAuthenticated.ts:reject',message:'Missing or invalid Bearer token',data:{path:req.path,reason:!header?'no_authorization_header':'invalid_bearer_prefix'},timestamp:Date.now(),hypothesisId:'A-C-D'})}).catch(()=>{});
    // #endregion
    throw new UnauthorizedError(AUTH_MESSAGES.MISSING_TOKEN);
  }

  const token = header.slice('Bearer '.length).trim();
  const tokenProvider = container.resolve<TokenProvider>(TOKENS.TokenProvider);
  const payload = tokenProvider.verifyAccessToken(token);

  req.user = { sub: payload.sub, role: payload.role };
  next();
}
