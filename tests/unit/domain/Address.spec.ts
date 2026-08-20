import { Address } from '../../../src/domain/value-objects/Address';
import { InvalidAddressError } from '../../../src/domain/exceptions/InvalidAddressError';

describe('Address value object', () => {
  it('normaliza CEP removendo caracteres nao numericos', () => {
    const address = Address.create({
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      zipCode: '01310-100',
      number: '1000',
    });

    expect(address.zipCode).toBe('01310100');
  });

  it('aceita endereco sem numero e sem complemento', () => {
    const address = Address.create({
      street: 'Estrada Rural',
      neighborhood: 'Zona Rural',
      zipCode: '01310100',
    });

    expect(address.number).toBeNull();
    expect(address.complement).toBeNull();
  });

  it('rejeita CEP invalido', () => {
    expect(() =>
      Address.create({
        street: 'Rua A',
        neighborhood: 'Centro',
        zipCode: '123',
      }),
    ).toThrow(InvalidAddressError);
  });

  it('rejeita rua ou bairro vazio', () => {
    expect(() =>
      Address.create({
        street: '   ',
        neighborhood: 'Centro',
        zipCode: '01310100',
      }),
    ).toThrow(InvalidAddressError);

    expect(() =>
      Address.create({
        street: 'Rua A',
        neighborhood: '   ',
        zipCode: '01310100',
      }),
    ).toThrow(InvalidAddressError);
  });
});
