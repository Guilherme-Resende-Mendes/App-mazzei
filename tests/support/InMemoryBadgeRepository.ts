import { Badge } from '../../src/domain/entities/Badge';
import { BadgeRepository } from '../../src/domain/repositories/BadgeRepository';

export const BADGE_PONTUAL = Badge.restore({
  slug: 'PONTUAL',
  name: 'Pontual',
  description: 'Chegou no horario combinado.',
  icon: null,
  active: true,
  sortOrder: 1,
});

export const BADGE_FLEXIVEL = Badge.restore({
  slug: 'FLEXIVEL',
  name: 'Flexivel',
  description: 'Se adaptou bem as necessidades do turno.',
  icon: null,
  active: true,
  sortOrder: 2,
});

export class InMemoryBadgeRepository implements BadgeRepository {
  public readonly items: Badge[];

  constructor(items: Badge[] = [BADGE_PONTUAL, BADGE_FLEXIVEL]) {
    this.items = [...items];
  }

  async findBySlug(slug: string): Promise<Badge | null> {
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async listActive(): Promise<Badge[]> {
    return this.sorted(this.items.filter((item) => item.active));
  }

  async listBySlugs(slugs: string[]): Promise<Badge[]> {
    return this.sorted(this.items.filter((item) => slugs.includes(item.slug)));
  }

  private sorted(badges: Badge[]): Badge[] {
    return [...badges].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug),
    );
  }
}
