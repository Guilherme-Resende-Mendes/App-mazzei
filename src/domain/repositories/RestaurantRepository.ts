import { Restaurant } from '../entities/Restaurant';

export interface RestaurantRepository {
  create(restaurant: Restaurant): Promise<Restaurant>;
  update(restaurant: Restaurant): Promise<Restaurant>;
  findById(id: string): Promise<Restaurant | null>;
  findByUserId(userId: string): Promise<Restaurant | null>;
  existsByCpfCnpj(cpfCnpj: string): Promise<boolean>;
  softDelete(id: string, deletedAt: Date): Promise<void>;
}
