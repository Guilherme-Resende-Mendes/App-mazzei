import { Area } from '../../domain/enums/Area';
import { Badge } from '../../domain/enums/Badge';

export interface CreateRestaurantProfileInput {
  userId: string;
  name: string;
  cpfCnpj: string;
  address: string;
  phone: string;
  requirementLevel?: number | null;
}

export interface UpdateRestaurantProfileInput {
  userId: string;
  name?: string;
  address?: string;
  phone?: string;
  requirementLevel?: number | null;
}

export interface RestaurantResponseDTO {
  id: string;
  userId: string;
  name: string;
  cpfCnpj: string;
  address: string;
  phone: string;
  requirementLevel: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateProfileInput {
  userId: string;
  name: string;
  document: string;
  address: string;
  phone: string;
  positionId: string;
  expectedSalary: number;
  bio?: string | null;
}

export interface UpdateCandidateProfileInput {
  userId: string;
  name?: string;
  address?: string;
  phone?: string;
  positionId?: string;
  expectedSalary?: number;
  bio?: string | null;
}

export interface CandidateBadgeDTO {
  badge: Badge;
  grantedAt: string;
}

export interface CandidateResponseDTO {
  id: string;
  userId: string;
  name: string;
  document: string;
  address: string;
  phone: string;
  positionId: string;
  expectedSalary: number;
  overallRating: number;
  bio: string | null;
  badges: CandidateBadgeDTO[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PositionResponseDTO {
  id: string;
  area: Area;
  name: string;
  level: number;
  active: boolean;
}

export interface GrantBadgeInput {
  candidateId: string;
  badge: Badge;
}

export interface RevokeBadgeInput {
  candidateId: string;
  badge: Badge;
}

export interface ListPositionsInput {
  area?: Area;
}
