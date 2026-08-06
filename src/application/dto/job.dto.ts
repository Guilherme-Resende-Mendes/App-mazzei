import { Area } from '../../domain/enums/Area';
import { JobStatus } from '../../domain/enums/JobStatus';

export interface CreateJobInput {
  userId: string;
  positionId: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  notes?: string | null;
  active?: boolean;
}

export interface UpdateJobInput {
  userId: string;
  jobId: string;
  positionId?: string;
  peopleCount?: number;
  notes?: string | null;
}

export interface RescheduleJobInput {
  userId: string;
  jobId: string;
  startDate: string;
  endDate: string;
}

export interface JobOwnerActionInput {
  userId: string;
  jobId: string;
}

export interface JobEvaluationInput {
  hiringId: string;
  deliveryRating: number;
  punctualityRating: number;
}

export interface FinishJobInput {
  userId: string;
  jobId: string;
  evaluations: JobEvaluationInput[];
}

export interface ListRestaurantJobsInput {
  userId: string;
  status?: JobStatus;
  active?: boolean;
  page?: number;
  perPage?: number;
}

export interface ListOpenJobsInput {
  area?: Area;
  positionId?: string;
  fromStartDate?: string;
  page?: number;
  perPage?: number;
}

export interface JobResponseDTO {
  id: string;
  restaurantId: string;
  positionId: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  status: JobStatus;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponseDTO<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
