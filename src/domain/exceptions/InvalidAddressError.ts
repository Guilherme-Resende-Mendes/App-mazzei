import { DomainException } from './DomainException';

export class InvalidAddressError extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
