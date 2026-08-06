import { Area } from '../enums/Area';

export interface PositionProps {
  id: string;
  area: Area;
  name: string;
  level: number;
  active: boolean;
  createdAt: Date;
}

/**
 * Cargo do catalogo fechado (area + nivel). Populado via seed.
 */
export class Position {
  private constructor(private props: PositionProps) {}

  static restore(props: PositionProps): Position {
    return new Position(props);
  }

  get id(): string {
    return this.props.id;
  }

  get area(): Area {
    return this.props.area;
  }

  get name(): string {
    return this.props.name;
  }

  get level(): number {
    return this.props.level;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isActive(): boolean {
    return this.props.active;
  }
}
