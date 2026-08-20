import { DomainException } from './DomainException';

export class InvalidCpfError extends DomainException {
  constructor(value: string) {
    super(`CPF invalido: ${value}`);
  }
}
