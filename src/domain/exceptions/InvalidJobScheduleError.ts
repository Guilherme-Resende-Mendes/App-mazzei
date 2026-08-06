import { DomainException } from './DomainException';

export class InvalidJobScheduleError extends DomainException {
  constructor(reason: string) {
    super(`Agendamento de vaga invalido: ${reason}`);
  }
}
