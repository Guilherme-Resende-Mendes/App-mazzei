import { InvalidRatingError } from '../exceptions/InvalidRatingError';

const MIN = 0;
const MAX = 5;

/**
 * Nota de avaliacao entre 0 e 5, com ate 2 casas decimais. Imutavel.
 */
export class Rating {
  private constructor(public readonly value: number) {}

  static create(raw: number): Rating {
    if (
      typeof raw !== 'number' ||
      Number.isNaN(raw) ||
      raw < MIN ||
      raw > MAX
    ) {
      throw new InvalidRatingError(raw);
    }

    return new Rating(Math.round(raw * 100) / 100);
  }

  toNumber(): number {
    return this.value;
  }
}
