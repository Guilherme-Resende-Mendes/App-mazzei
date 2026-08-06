import { Restaurant } from '../../src/domain/entities/Restaurant';
import { RestaurantRepository } from '../../src/domain/repositories/RestaurantRepository';

export class InMemoryRestaurantRepository implements RestaurantRepository {
  public readonly items: Restaurant[] = [];

  async create(restaurant: Restaurant): Promise<Restaurant> {
    this.items.push(restaurant);
    return restaurant;
  }

  async update(restaurant: Restaurant): Promise<Restaurant> {
    const index = this.items.findIndex((item) => item.id === restaurant.id);
    if (index >= 0) this.items[index] = restaurant;
    return restaurant;
  }

  async findById(id: string): Promise<Restaurant | null> {
    return (
      this.items.find((item) => item.id === id && !item.isDeleted()) ?? null
    );
  }

  async findByUserId(userId: string): Promise<Restaurant | null> {
    return (
      this.items.find((item) => item.userId === userId && !item.isDeleted()) ??
      null
    );
  }

  async existsByCpfCnpj(cpfCnpj: string): Promise<boolean> {
    return this.items.some((item) => item.cpfCnpj === cpfCnpj);
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    const restaurant = this.items.find((item) => item.id === id);
    restaurant?.softDelete(deletedAt);
  }
}
