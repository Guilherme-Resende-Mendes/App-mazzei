import { Role } from '../enums/Role';
import { Email } from '../value-objects/Email';

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  role: Role;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserProps {
  id?: string;
  email: string;
  passwordHash: string;
  role: Role;
}

/**
 * Entidade de dominio que representa a identidade de autenticacao.
 * O perfil de negocio (Restaurant/Candidate) e modelado separadamente.
 */
export class User {
  private constructor(private props: UserProps) {}

  static create(props: CreateUserProps, now: Date = new Date()): User {
    return new User({
      id: props.id ?? crypto.randomUUID(),
      email: Email.create(props.email),
      passwordHash: props.passwordHash,
      role: props.role,
      active: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  /** Reconstrucao a partir da persistencia (sem revalidar regras de criacao). */
  static restore(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): Role {
    return this.props.role;
  }

  get active(): boolean {
    return this.props.active;
  }

  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
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

  isActive(): boolean {
    return this.props.active && this.props.deletedAt === null;
  }

  registerLogin(now: Date = new Date()): void {
    this.props.lastLoginAt = now;
    this.props.updatedAt = now;
  }
}
