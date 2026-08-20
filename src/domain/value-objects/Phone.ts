import { InvalidPhoneError } from '../exceptions/InvalidPhoneError';
import {
  isValidBrazilianPhone,
  normalizeBrazilianPhone,
} from '../../shared/utils/brValidation';

/**
 * Value Object de telefone brasileiro: normaliza e valida DDD e numero.
 */
export class Phone {
  private constructor(public readonly value: string) {}

  static create(raw: string): Phone {
    const normalized = normalizeBrazilianPhone(raw);

    if (!isValidBrazilianPhone(normalized)) {
      throw new InvalidPhoneError(raw);
    }

    return new Phone(normalized);
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
