import { Role } from '../../domain/enums/Role';

export interface RequestContext {
  userAgent?: string | null;
  ip?: string | null;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  role: Role.CLIENT | Role.OWNER;
}

export interface LoginInput extends RequestContext {
  email: string;
  password: string;
}

export interface RefreshTokenInput extends RequestContext {
  refreshToken: string;
}

export interface LogoutInput {
  refreshToken: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AuthResultDTO extends AuthTokensDTO {
  user: UserResponseDTO;
}
