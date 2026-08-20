import { InvalidAddressError } from '../exceptions/InvalidAddressError';

const CEP_REGEX = /^\d{8}$/;
const MAX_STREET_LENGTH = 255;
const MAX_NEIGHBORHOOD_LENGTH = 100;
const MAX_NUMBER_LENGTH = 20;
const MAX_COMPLEMENT_LENGTH = 100;

export interface AddressProps {
  street: string;
  neighborhood: string;
  number: string | null;
  complement: string | null;
  zipCode: string;
}

export interface CreateAddressProps {
  street: string;
  neighborhood: string;
  number?: string | null;
  complement?: string | null;
  zipCode: string;
}

/**
 * Value Object de endereco brasileiro.
 * CEP, rua e bairro sao obrigatorios; numero e complemento sao opcionais.
 */
export class Address {
  private constructor(private readonly props: AddressProps) {}

  static create(raw: CreateAddressProps): Address {
    const street = raw.street.trim();
    const neighborhood = raw.neighborhood.trim();
    const zipCode = Address.normalizeZipCode(raw.zipCode);
    const number = Address.normalizeOptionalField(raw.number, MAX_NUMBER_LENGTH);
    const complement = Address.normalizeOptionalField(
      raw.complement,
      MAX_COMPLEMENT_LENGTH,
    );

    if (!CEP_REGEX.test(zipCode)) {
      throw new InvalidAddressError('CEP deve conter 8 digitos numericos.');
    }

    if (!street) {
      throw new InvalidAddressError('Rua e obrigatoria.');
    }

    if (street.length > MAX_STREET_LENGTH) {
      throw new InvalidAddressError('Rua excede o tamanho maximo permitido.');
    }

    if (!neighborhood) {
      throw new InvalidAddressError('Bairro e obrigatorio.');
    }

    if (neighborhood.length > MAX_NEIGHBORHOOD_LENGTH) {
      throw new InvalidAddressError('Bairro excede o tamanho maximo permitido.');
    }

    return new Address({
      street,
      neighborhood,
      number,
      complement,
      zipCode,
    });
  }

  static restore(props: AddressProps): Address {
    return new Address(props);
  }

  static normalizeZipCode(raw: string): string {
    return raw.replace(/\D/g, '');
  }

  private static normalizeOptionalField(
    value: string | null | undefined,
    maxLength: number,
  ): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (trimmed.length > maxLength) {
      throw new InvalidAddressError(
        'Campo de endereco excede o tamanho maximo permitido.',
      );
    }

    return trimmed;
  }

  get street(): string {
    return this.props.street;
  }

  get neighborhood(): string {
    return this.props.neighborhood;
  }

  get number(): string | null {
    return this.props.number;
  }

  get complement(): string | null {
    return this.props.complement;
  }

  get zipCode(): string {
    return this.props.zipCode;
  }

  equals(other: Address): boolean {
    return (
      this.props.street === other.props.street &&
      this.props.neighborhood === other.props.neighborhood &&
      this.props.number === other.props.number &&
      this.props.complement === other.props.complement &&
      this.props.zipCode === other.props.zipCode
    );
  }

  toJSON(): AddressProps {
    return { ...this.props };
  }
}
