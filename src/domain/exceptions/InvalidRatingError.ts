import { DomainException } from './DomainException';

export class InvalidRatingError extends DomainException {
  constructor(value: number) {
    super(`Nota invalida: ${value}. Deve estar entre 0 e 5.`);
  }
}
