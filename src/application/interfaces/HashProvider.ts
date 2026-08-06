/**
 * Abstracao de hashing de senhas. A implementacao concreta (bcrypt)
 * vive na infraestrutura.
 */
export interface HashProvider {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
