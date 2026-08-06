/**
 * Tokens de injecao de dependencia.
 * Interfaces sao apagadas em runtime, entao usamos tokens explicitos
 * para registrar/resolver implementacoes no container (tsyringe).
 */
export const TOKENS = {
  UserRepository: 'UserRepository',
  RefreshTokenRepository: 'RefreshTokenRepository',
  RestaurantRepository: 'RestaurantRepository',
  CandidateRepository: 'CandidateRepository',
  PositionRepository: 'PositionRepository',
  JobRepository: 'JobRepository',
  HiringRepository: 'HiringRepository',
  UnitOfWork: 'UnitOfWork',
  HashProvider: 'HashProvider',
  TokenProvider: 'TokenProvider',
} as const;

export type Token = (typeof TOKENS)[keyof typeof TOKENS];
