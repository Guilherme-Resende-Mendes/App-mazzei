import { Prisma } from '../prisma/generated/client';
import { Address } from '../../../domain/value-objects/Address';
import { InvalidAddressError } from '../../../domain/exceptions/InvalidAddressError';

interface StoredAddress {
  rua: string;
  bairro: string;
  numero: string | null;
  complemento: string | null;
  cep: string;
}

function isStoredAddress(value: unknown): value is StoredAddress {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.rua === 'string' &&
    typeof record.bairro === 'string' &&
    (typeof record.numero === 'string' || record.numero === null) &&
    (typeof record.complemento === 'string' || record.complemento === null) &&
    typeof record.cep === 'string'
  );
}

export class AddressPrismaMapper {
  static toDomain(value: Prisma.JsonValue): Address {
    if (!isStoredAddress(value)) {
      throw new InvalidAddressError('Endereco armazenado em formato invalido.');
    }

    return Address.restore({
      street: value.rua,
      neighborhood: value.bairro,
      number: value.numero,
      complement: value.complemento,
      zipCode: Address.normalizeZipCode(value.cep),
    });
  }

  static toPersistence(address: Address): Prisma.InputJsonValue {
    return {
      rua: address.street,
      bairro: address.neighborhood,
      numero: address.number,
      complemento: address.complement,
      cep: address.zipCode,
    };
  }
}
