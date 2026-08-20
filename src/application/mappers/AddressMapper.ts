import { Address } from '../../domain/value-objects/Address';
import { AddressDTO } from '../dto/address.dto';

export class AddressMapper {
  static toDomain(dto: AddressDTO): Address {
    return Address.create({
      street: dto.rua,
      neighborhood: dto.bairro,
      number: dto.numero,
      complement: dto.complemento,
      zipCode: dto.cep,
    });
  }

  static toDTO(address: Address): AddressDTO {
    return {
      rua: address.street,
      bairro: address.neighborhood,
      numero: address.number,
      complemento: address.complement,
      cep: address.zipCode,
    };
  }
}
