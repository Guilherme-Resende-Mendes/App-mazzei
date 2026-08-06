import { HiringStatus } from '../../domain/enums/HiringStatus';

export interface ApplyForJobInput {
  userId: string;
  jobId: string;
}

export interface CancelApplicationInput {
  userId: string;
  hiringId: string;
}

export interface AcceptCandidateInput {
  userId: string;
  hiringId: string;
  agreedPrice: number;
}

export interface RejectCandidateInput {
  userId: string;
  hiringId: string;
}

export interface ListCandidateApplicationsInput {
  userId: string;
}

export interface ListJobApplicationsInput {
  userId: string;
  jobId: string;
}

export interface HiringResponseDTO {
  id: string;
  jobId: string;
  candidateId: string;
  restaurantId: string;
  agreedPrice: string | null;
  status: HiringStatus;
  requestedAt: string;
  respondedAt: string | null;
  deliveryRating: number | null;
  punctualityRating: number | null;
  cancellationFault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateReviewDTO {
  hiringId: string;
  jobId: string;
  deliveryRating: number;
  punctualityRating: number;
  average: number;
  concludedAt: string;
}
