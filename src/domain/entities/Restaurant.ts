export interface RestaurantProps {
  id: string;
  userId: string;
  name: string;
  cpfCnpj: string;
  address: string;
  phone: string;
  requirementLevel: number | null;
  bio: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateRestaurantProps {
  id?: string;
  userId: string;
  name: string;
  cpfCnpj: string;
  address: string;
  phone: string;
  requirementLevel?: number | null;
  bio?: string | null;
}

export interface UpdateRestaurantProps {
  name?: string;
  address?: string;
  phone?: string;
  requirementLevel?: number | null;
  bio?: string | null;
}

/**
 * Perfil de restaurante (papel OWNER, 1:1 com usuario).
 */
export class Restaurant {
  private constructor(private props: RestaurantProps) {}

  static create(
    props: CreateRestaurantProps,
    now: Date = new Date(),
  ): Restaurant {
    return new Restaurant({
      id: props.id ?? crypto.randomUUID(),
      userId: props.userId,
      name: props.name,
      cpfCnpj: props.cpfCnpj,
      address: props.address,
      phone: props.phone,
      requirementLevel: props.requirementLevel ?? null,
      bio: props.bio ?? null,
      active: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static restore(props: RestaurantProps): Restaurant {
    return new Restaurant(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get cpfCnpj(): string {
    return this.props.cpfCnpj;
  }

  get address(): string {
    return this.props.address;
  }

  get phone(): string {
    return this.props.phone;
  }

  get requirementLevel(): number | null {
    return this.props.requirementLevel;
  }

  get bio(): string | null {
    return this.props.bio;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  update(changes: UpdateRestaurantProps, now: Date = new Date()): void {
    if (changes.name !== undefined) this.props.name = changes.name;
    if (changes.address !== undefined) this.props.address = changes.address;
    if (changes.phone !== undefined) this.props.phone = changes.phone;
    if (changes.requirementLevel !== undefined) {
      this.props.requirementLevel = changes.requirementLevel;
    }
    if (changes.bio !== undefined) this.props.bio = changes.bio;
    this.props.updatedAt = now;
  }

  softDelete(now: Date = new Date()): void {
    this.props.deletedAt = now;
    this.props.active = false;
    this.props.updatedAt = now;
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }
}
