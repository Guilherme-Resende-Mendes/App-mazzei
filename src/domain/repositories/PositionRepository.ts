import { Position } from '../entities/Position';
import { Area } from '../enums/Area';

export interface PositionRepository {
  findById(id: string): Promise<Position | null>;
  listByArea(area?: Area): Promise<Position[]>;
  isActive(id: string): Promise<boolean>;
}
