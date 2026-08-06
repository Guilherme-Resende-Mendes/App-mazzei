import { parseDurationToMs } from '../../../src/shared/utils/duration';

describe('parseDurationToMs', () => {
  it.each([
    ['30s', 30_000],
    ['15m', 900_000],
    ['2h', 7_200_000],
    ['7d', 604_800_000],
  ])('converte %s em %d ms', (input, expected) => {
    expect(parseDurationToMs(input)).toBe(expected);
  });

  it.each(['', 'abc', '10x', '10'])(
    'lanca erro para duracao invalida: %s',
    (input) => {
      expect(() => parseDurationToMs(input)).toThrow('Duracao invalida');
    },
  );
});
