/**
 * Base para violacoes de invariantes do dominio.
 * Nao conhece HTTP: a camada de apresentacao decide como mapear.
 */
export abstract class DomainException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
