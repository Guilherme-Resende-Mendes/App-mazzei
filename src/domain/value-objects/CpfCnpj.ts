import { InvalidCpfCnpjError } from '../exceptions/InvalidCpfCnpjError';
import {
  isValidCpfOrCnpj,
  normalizeDigits,
} from '../../shared/utils/brValidation';

/**
 * Value Object de CPF ou CNPJ: normaliza para digitos e valida os digitos verificadores.
 */
export class CpfCnpj {
  private constructor(public readonly value: string) {}

  static create(raw: string): CpfCnpj {
    const normalized = normalizeDigits(raw);

    if (!isValidCpfOrCnpj(normalized)) {
      throw new InvalidCpfCnpjError(raw);
    }

    return new CpfCnpj(normalized);
  }

  equals(other: CpfCnpj): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
