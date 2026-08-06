export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciais invalidas',
  EMAIL_IN_USE: 'E-mail ja cadastrado',
  DOCUMENT_IN_USE: 'Documento ja cadastrado',
  USER_INACTIVE: 'Usuario inativo',
  USER_NOT_FOUND: 'Usuario nao encontrado',
  INVALID_REFRESH_TOKEN: 'Refresh token invalido ou expirado',
  MISSING_TOKEN: 'Token de autenticacao ausente',
  INVALID_TOKEN: 'Token de autenticacao invalido',
  FORBIDDEN_ROLE: 'Perfil sem permissao para este recurso',
} as const;
