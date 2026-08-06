import { Hiring } from '../entities/Hiring';
import { Rating } from '../value-objects/Rating';

/**
 * Recalcula a nota geral do candidato: media de ((entrega + pontualidade) / 2)
 * sobre contratacoes CONCLUIDA sem falta de cancelamento. Retorna Rating(0) se
 * nao houver contratacoes elegiveis.
 */
export class CandidateRatingService {
  static calculate(hirings: Hiring[]): Rating {
    const eligible = hirings.filter((hiring) => hiring.countsForRating());

    if (eligible.length === 0) {
      return Rating.create(0);
    }

    const sum = eligible.reduce((acc, hiring) => {
      const delivery = hiring.deliveryRating ?? 0;
      const punctuality = hiring.punctualityRating ?? 0;
      return acc + (delivery + punctuality) / 2;
    }, 0);

    return Rating.create(sum / eligible.length);
  }
}
