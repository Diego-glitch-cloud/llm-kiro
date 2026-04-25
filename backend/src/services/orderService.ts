import { v4 as uuidv4 } from 'uuid';
import { Game, Order, DataStore, CreateOrderRequest } from '../types/index';
import { HttpError } from '../types/errors';
import { saveDataStore } from './dataStore';

export interface OrderItem {
  gameId: string;
  quantity: number;
}

export function validateStock(items: OrderItem[], games: Game[]): void {
  for (const item of items) {
    const game = games.find((g) => g.id === item.gameId);
    if (!game || game.stock < item.quantity) {
      const title = game ? game.title : item.gameId;
      const available = game ? game.stock : 0;
      throw new HttpError(
        409,
        `Insufficient stock for game: ${title}. Available: ${available}`
      );
    }
  }
}

export function createOrder(request: CreateOrderRequest, dataStore: DataStore): Order {
  validateStock(request.items, dataStore.games);

  // Decrement stock and build order items snapshot
  const orderItems: Order['items'] = request.items.map((item) => {
    const game = dataStore.games.find((g) => g.id === item.gameId)!;
    game.stock -= item.quantity;
    return {
      gameId: game.id,
      gameTitle: game.title,
      quantity: item.quantity,
      unitPrice: game.price,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const order: Order = {
    id: uuidv4(),
    buyer: request.buyer,
    items: orderItems,
    total,
    createdAt: new Date().toISOString(),
  };

  dataStore.orders.push(order);
  saveDataStore(dataStore);

  return order;
}
