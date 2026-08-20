import { Area } from '../../domain/enums/Area';
import { Badge } from '../../domain/enums/Badge';
import { AddressDTO } from './address.dto';

export interface CreateRestaurantProfileInput {
  userId: string;
  name: string;
  cpfCnpj: string;
  address: AddressDTO;
  phone: string;
  requirementLevel?: number | null;
  bio?: string | null;
}

export interface UpdateRestaurantProfileInput {
  userId: string;
  name?: string;
  address?: AddressDTO;
  phone?: string;
  requirementLevel?: number | null;
  bio?: string | null;
}

export interface RestaurantResponseDTO {
  id: string;
  userId: string;
  name: string;
  address: AddressDTO;
  requirementLevel: number | null;
  bio: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantCpfCnpjResponseDTO {
  cpfCnpj: string;
}

export interface RestaurantPhoneResponseDTO {
  phone: string;
}

export interface CandidateCpfResponseDTO {
  cpf: string;
}

export interface CandidatePhoneResponseDTO {
  phone: string;
}

export interface CreateCandidateProfileInput {
  userId: string;
  name: string;
  document: string;
  address: AddressDTO;
  phone: string;
  positionId: string;
  bio?: string | null;
}

export interface UpdateCandidateProfileInput {
  userId: string;
  name?: string;
  address?: AddressDTO;
  phone?: string;
  positionId?: string;
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
  address: AddressDTO;
  positionId: string;
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
