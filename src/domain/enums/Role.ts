/**
 * Perfis de acesso do sistema.
 * Definido no dominio, independente do Prisma. A infraestrutura mapeia
 * este enum para o enum gerado pelo Prisma (mesmos valores).
 */
export enum Role {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export const ROLES: readonly Role[] = Object.values(Role);

export function isRole(value: string): value is Role {
  return ROLES.includes(value as Role);
}
