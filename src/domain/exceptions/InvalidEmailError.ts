import { DomainException } from './DomainException';

export class InvalidEmailError extends DomainException {
  constructor(value: string) {
    super(`E-mail invalido: ${value}`);
  }
}
