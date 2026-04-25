export interface Game {
  id: string;           // UUID v4
  title: string;
  description: string;
  price: number;        // en USD, ej: 59.99
  genre: string;        // ej: "Action", "RPG", "Sports"
  platform: string;     // ej: "PC", "PS5", "Xbox", "Nintendo Switch"
  imageUrl: string;     // URL de imagen del juego
  stock: number;        // entero >= 0
}

export interface CartItem {
  game: Game;
  quantity: number;     // entero >= 1
}

export interface Order {
  id: string;           // UUID v4
  buyer: {
    name: string;
    email: string;
    address: string;
  };
  items: Array<{
    gameId: string;
    gameTitle: string;  // snapshot del título al momento de la compra
    quantity: number;
    unitPrice: number;  // snapshot del precio al momento de la compra
  }>;
  total: number;        // suma de (unitPrice × quantity)
  createdAt: string;    // ISO 8601
}

export interface DataStore {
  games: Game[];
  orders: Order[];
}

// POST /api/orders - Request
export interface CreateOrderRequest {
  buyer: {
    name: string;
    email: string;
    address: string;
  };
  items: Array<{
    gameId: string;
    quantity: number;
  }>;
}

// POST /api/orders - Response 201
export interface OrderResponse {
  orderId: string;
  total: number;
  createdAt: string;
}

export interface BuyerInfo {
  name: string;
  email: string;
  address: string;
}
