import { InvalidEmailError } from '../exceptions/InvalidEmailError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Value Object de e-mail: normaliza (trim + lowercase) e garante formato valido.
 * Imutavel; a igualdade e por valor.
 */
export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalized) || normalized.length > 255) {
      throw new InvalidEmailError(raw);
    }

    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
