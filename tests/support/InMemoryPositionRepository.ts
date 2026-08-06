import { Position } from '../../src/domain/entities/Position';
import { Area } from '../../src/domain/enums/Area';
import { PositionRepository } from '../../src/domain/repositories/PositionRepository';

export class InMemoryPositionRepository implements PositionRepository {
  constructor(public readonly items: Position[] = []) {}

  seed(position: Position): void {
    this.items.push(position);
  }

  async findById(id: string): Promise<Position | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async listByArea(area?: Area): Promise<Position[]> {
    return this.items.filter(
      (item) => item.active && (area === undefined || item.area === area),
    );
  }

  async isActive(id: string): Promise<boolean> {
    return this.items.some((item) => item.id === id && item.active);
  }
}
