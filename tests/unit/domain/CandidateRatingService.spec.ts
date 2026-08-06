import { Hiring } from '../../../src/domain/entities/Hiring';
import { CandidateRatingService } from '../../../src/domain/services/CandidateRatingService';
import { Rating } from '../../../src/domain/value-objects/Rating';

function concludedHiring(delivery: number, punctuality: number): Hiring {
  const hiring = Hiring.create({
    jobId: 'job',
    candidateId: 'cand',
    restaurantId: 'rest',
  });
  hiring.accept(null);
  hiring.conclude(Rating.create(delivery), Rating.create(punctuality));
  return hiring;
}

describe('CandidateRatingService', () => {
  it('retorna 0 quando nao ha contratacoes elegiveis', () => {
    expect(CandidateRatingService.calculate([]).toNumber()).toBe(0);
  });

  it('calcula a media de (entrega+pontualidade)/2', () => {
    const hirings = [concludedHiring(5, 5), concludedHiring(4, 3)];
    // (5 + 3.5) / 2 = 4.25
    expect(CandidateRatingService.calculate(hirings).toNumber()).toBe(4.25);
  });

  it('ignora contratacoes canceladas com falta', () => {
    const faulty = Hiring.create({
      jobId: 'job',
      candidateId: 'cand',
      restaurantId: 'rest',
    });
    faulty.accept(null);
    faulty.cancel();

    const hirings = [concludedHiring(5, 5), faulty];
    expect(CandidateRatingService.calculate(hirings).toNumber()).toBe(5);
  });
});
