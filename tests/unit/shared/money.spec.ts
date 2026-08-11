import {
  formatMoney,
  hasAtMostTwoDecimalPlaces,
  roundMoney,
} from '../../../src/shared/utils/money';

describe('money utils', () => {
  it('roundMoney arredonda para 2 casas', () => {
    expect(roundMoney(100.105)).toBe(100.11);
    expect(roundMoney(100.1)).toBe(100.1);
  });

  it('formatMoney preserva duas casas decimais na string', () => {
    expect(formatMoney(100.1)).toBe('100.10');
    expect(formatMoney(100)).toBe('100.00');
    expect(formatMoney(100.99)).toBe('100.99');
  });

  it('hasAtMostTwoDecimalPlaces valida precisao monetaria', () => {
    expect(hasAtMostTwoDecimalPlaces(100.1)).toBe(true);
    expect(hasAtMostTwoDecimalPlaces(100.12)).toBe(true);
    expect(hasAtMostTwoDecimalPlaces(100.123)).toBe(false);
  });
});

describe('HiringMapper agreedPrice', () => {
  it('formata agreedPrice com duas casas decimais', async () => {
    const { Hiring } = await import('../../../src/domain/entities/Hiring');
    const { HiringMapper } =
      await import('../../../src/application/mappers/HiringMapper');

    const hiring = Hiring.create({
      jobId: 'job',
      candidateId: 'cand',
      restaurantId: 'rest',
      hourlyRate: 100,
    });
    hiring.accept(100.1);

    expect(HiringMapper.toResponse(hiring).agreedPrice).toBe('100.10');
  });
});
