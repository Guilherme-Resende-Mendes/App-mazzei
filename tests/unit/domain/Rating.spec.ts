import { Rating } from '../../../src/domain/value-objects/Rating';
import { InvalidRatingError } from '../../../src/domain/exceptions/InvalidRatingError';

describe('Rating', () => {
  it('cria uma nota valida e arredonda para 2 casas', () => {
    expect(Rating.create(4.256).toNumber()).toBe(4.26);
    expect(Rating.create(0).toNumber()).toBe(0);
    expect(Rating.create(5).toNumber()).toBe(5);
  });

  it('rejeita notas fora do intervalo 0..5', () => {
    expect(() => Rating.create(-1)).toThrow(InvalidRatingError);
    expect(() => Rating.create(5.1)).toThrow(InvalidRatingError);
    expect(() => Rating.create(Number.NaN)).toThrow(InvalidRatingError);
  });
});
