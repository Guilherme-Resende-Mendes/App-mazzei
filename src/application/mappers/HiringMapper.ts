import { Hiring } from '../../domain/entities/Hiring';
import { formatMoney } from '../../shared/utils/money';
import { CandidateReviewDTO, HiringResponseDTO } from '../dto/application.dto';

export class HiringMapper {
  static toResponse(hiring: Hiring): HiringResponseDTO {
    return {
      id: hiring.id,
      jobId: hiring.jobId,
      candidateId: hiring.candidateId,
      restaurantId: hiring.restaurantId,
      agreedPrice:
        hiring.agreedPrice !== null
          ? formatMoney(hiring.agreedPrice)
          : null,
      status: hiring.status,
      requestedAt: hiring.requestedAt.toISOString(),
      respondedAt: hiring.respondedAt?.toISOString() ?? null,
      deliveryRating: hiring.deliveryRating,
      punctualityRating: hiring.punctualityRating,
      cancellationFault: hiring.cancellationFault,
      createdAt: hiring.createdAt.toISOString(),
      updatedAt: hiring.updatedAt.toISOString(),
    };
  }

  static toReview(hiring: Hiring): CandidateReviewDTO {
    const delivery = hiring.deliveryRating ?? 0;
    const punctuality = hiring.punctualityRating ?? 0;

    return {
      hiringId: hiring.id,
      jobId: hiring.jobId,
      deliveryRating: delivery,
      punctualityRating: punctuality,
      average: Math.round(((delivery + punctuality) / 2) * 100) / 100,
      concludedAt: hiring.updatedAt.toISOString(),
    };
  }
}
