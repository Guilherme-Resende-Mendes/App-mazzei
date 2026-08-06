import { formatMoney, roundMoney } from '../../../shared/utils/money';
import { Prisma } from '../prisma/generated/client';

/** Converte um Decimal do Prisma (ou number) em number nativo. */
export function decimalToNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export function nullableDecimalToNumber(
  value: Prisma.Decimal | number | null,
): number | null {
  return value === null ? null : decimalToNumber(value);
}

/** Converte number monetario para Decimal com escala fixa de 2 casas. */
export function numberToDecimalMoney(value: number): Prisma.Decimal {
  return new Prisma.Decimal(formatMoney(value));
}

export function nullableNumberToDecimalMoney(
  value: number | null,
): Prisma.Decimal | null {
  return value === null ? null : numberToDecimalMoney(value);
}

/** Le Decimal monetario do banco normalizado para 2 casas. */
export function nullableDecimalToMoneyNumber(
  value: Prisma.Decimal | number | null,
): number | null {
  return value === null ? null : roundMoney(decimalToNumber(value));
}
