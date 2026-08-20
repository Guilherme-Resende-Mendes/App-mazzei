import { DomainException } from './DomainException';

export class InvalidPhoneError extends DomainException {
  constructor(value: string) {
    super(`Telefone invalido: ${value}`);
  }
}
