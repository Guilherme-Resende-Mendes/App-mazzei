import { DomainException } from './DomainException';

export class InvalidCpfCnpjError extends DomainException {
  constructor(value: string) {
    super(`CPF/CNPJ invalido: ${value}`);
  }
}
