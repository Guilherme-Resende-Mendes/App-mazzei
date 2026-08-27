export interface BadgeProps {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  sortOrder: number;
}

/**
 * Selo do catalogo da plataforma. O `slug` e a identidade estavel exposta pela API;
 * `name`, `description` e `icon` existem para o front-end renderizar sem manter um
 * mapa proprio. Selos aposentados ficam inativos para nao apagar o historico.
 */
export class Badge {
  private constructor(private props: BadgeProps) {}

  static restore(props: BadgeProps): Badge {
    return new Badge(props);
  }

  get slug(): string {
    return this.props.slug;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get icon(): string | null {
    return this.props.icon;
  }

  get active(): boolean {
    return this.props.active;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }
}

/** Normaliza a entrada da API para a forma canonica do slug. */
export function normalizeBadgeSlug(value: string): string {
  return value.trim().toUpperCase();
}
