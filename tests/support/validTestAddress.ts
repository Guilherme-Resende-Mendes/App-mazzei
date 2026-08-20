import { Address } from '../../src/domain/value-objects/Address';
import { AddressDTO } from '../../src/application/dto/address.dto';

export const validTestAddress = (
  overrides: Partial<AddressDTO> = {},
): AddressDTO => ({
  rua: 'Avenida Paulista',
  bairro: 'Bela Vista',
  numero: '1000',
  complemento: null,
  cep: '01310100',
  ...overrides,
});

export const testAddressEntity = (
  overrides: Partial<{
    street: string;
    neighborhood: string;
    number: string | null;
    complement: string | null;
    zipCode: string;
  }> = {},
): Address =>
  Address.create({
    street: 'Avenida Paulista',
    neighborhood: 'Bela Vista',
    number: '1000',
    complement: null,
    zipCode: '01310100',
    ...overrides,
  });
