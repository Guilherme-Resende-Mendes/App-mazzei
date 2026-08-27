import { Badge } from '../entities/Badge';

export interface BadgeRepository {
  findBySlug(slug: string): Promise<Badge | null>;
  /** Catalogo oferecido ao restaurante e ao front-end. */
  listActive(): Promise<Badge[]>;
  /**
   * Metadados dos selos informados, ignorando `ativo`: o placar precisa exibir
   * corretamente selos que foram aposentados depois de concedidos.
   */
  listBySlugs(slugs: string[]): Promise<Badge[]>;
}
