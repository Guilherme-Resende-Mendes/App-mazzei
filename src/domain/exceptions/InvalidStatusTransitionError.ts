import { DomainException } from './DomainException';

export class InvalidStatusTransitionError extends DomainException {
  constructor(entity: string, from: string, action: string) {
    super(
      `Transicao invalida em ${entity}: nao e possivel ${action} (estado atual: ${from}).`,
    );
  }
}
