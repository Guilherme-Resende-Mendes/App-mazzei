import { InvalidCpfError } from '../exceptions/InvalidCpfError';
import { isValidCpf, normalizeDigits } from '../../shared/utils/brValidation';

/**
 * Value Object de CPF: normaliza para digitos e valida os digitos verificadores.
 */
export class Cpf {
  private constructor(public readonly value: string) {}

  static create(raw: string): Cpf {
    const normalized = normalizeDigits(raw);

    if (!isValidCpf(normalized)) {
      throw new InvalidCpfError(raw);
    }

    return new Cpf(normalized);
  }

  equals(other: Cpf): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
