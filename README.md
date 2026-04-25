# 🎮 Videogame Store

Aplicación web full stack de e-commerce para la venta de videojuegos. Permite explorar un catálogo, gestionar un carrito de compras y completar pedidos. Construida con **React + TypeScript** en el frontend, **Express + TypeScript** en el backend, persistencia en **archivo JSON** y orquestación completa con **Docker Compose**.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Levantar la aplicación](#levantar-la-aplicación)
3. [Verificar el funcionamiento](#verificar-el-funcionamiento)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Arquitectura](#arquitectura)
6. [API Reference](#api-reference)
7. [Modelos de datos](#modelos-de-datos)
8. [Imágenes locales](#imágenes-locales)
9. [Comandos útiles](#comandos-útiles)
10. [Proceso de creación](#proceso-de-creación)

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Docker      | 24+           | `docker --version` |
| Docker Compose | v2 (plugin) | `docker compose version` |

> No se necesita Node.js instalado localmente. Todo corre dentro de los contenedores.

---

## Levantar la aplicación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd llm-kiro
```

### 2. Construir y levantar los contenedores

```bash
docker compose up --build -d
```

Este comando:
- Construye la imagen del **backend** (compila TypeScript → `dist/`)
- Construye la imagen del **frontend** (instala dependencias, inicia Vite dev server)
- Crea la red interna `llm-kiro_default`
- Monta `backend/data.json` como volumen para persistencia de datos
- Levanta ambos servicios en modo detached (background)

### 3. Verificar que los contenedores están corriendo

```bash
docker ps
```

Deberías ver dos contenedores activos:

```
CONTAINER ID   IMAGE                  PORTS                    NAMES
xxxxxxxxxxxx   llm-kiro-frontend      0.0.0.0:3000->3000/tcp   llm-kiro-frontend-1
xxxxxxxxxxxx   llm-kiro-backend       0.0.0.0:3001->3001/tcp   llm-kiro-backend-1
```

### 4. Abrir la aplicación

| Servicio  | URL                        | Descripción                    |
|-----------|----------------------------|--------------------------------|
| Frontend  | http://localhost:3000      | Interfaz de usuario React      |
| Backend   | http://localhost:3001/api  | API REST Express               |
| Imágenes  | http://localhost:3001/img/ | Archivos estáticos locales     |

---

## Verificar el funcionamiento

### Verificación rápida de la API

```bash
# Listar todos los juegos
curl http://localhost:3001/api/games

# Obtener un juego por ID
curl http://localhost:3001/api/games/a1b2c3d4-e5f6-7890-abcd-ef1234567890

# Crear una orden de prueba
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": {
      "name": "Juan García",
      "email": "juan@ejemplo.com",
      "address": "Calle Falsa 123, Ciudad"
    },
    "items": [
      { "gameId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "quantity": 1 }
    ]
  }'

# Consultar una orden (reemplaza el ID con el devuelto arriba)
curl http://localhost:3001/api/orders/<orderId>
```

### Flujo completo en el navegador

1. Abre **http://localhost:3000**
2. Explora el catálogo — filtra por género, plataforma o busca por título
3. Haz clic en una tarjeta para ver el detalle del juego
4. Agrega juegos al carrito con el botón **"+ Carrito"**
5. Abre el carrito con el ícono 🛒 en el header
6. Ajusta cantidades o elimina ítems desde el panel lateral
7. Haz clic en **"Proceder al checkout"**
8. Completa el formulario con nombre, email y dirección
9. Confirma el pedido — verás la pantalla de confirmación con el número de orden
10. El stock se actualiza automáticamente en `backend/data.json`

### Verificar persistencia de datos

```bash
# Ver las órdenes guardadas en el JSON
cat backend/data.json | python3 -m json.tool | grep -A5 '"orders"'
```

---

## Estructura del proyecto

```
llm-kiro/
├── docker-compose.yml          # Orquestación de servicios
│
├── backend/
│   ├── Dockerfile              # Imagen Node 20 Alpine + compilación TS
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── data.json               # DataStore (base de datos JSON) — montado como volumen
│   ├── img/                    # Imágenes locales servidas como estáticos
│   │   ├── gran-turismo.png
│   │   └── zelda.png
│   └── src/
│       ├── server.ts           # Entry point Express
│       ├── types/
│       │   ├── index.ts        # Interfaces: Game, Order, DataStore, etc.
│       │   └── errors.ts       # Clase HttpError tipada
│       ├── middleware/
│       │   ├── cors.ts         # CORS configurado para localhost:3000
│       │   └── errorHandler.ts # Middleware centralizado de errores
│       ├── routes/
│       │   ├── games.ts        # GET /api/games, GET /api/games/:id
│       │   └── orders.ts       # POST /api/orders, GET /api/orders/:id
│       ├── services/
│       │   ├── dataStore.ts    # loadDataStore / saveDataStore + snapshot
│       │   └── orderService.ts # validateStock / createOrder
│       └── validators/
│           └── orderValidator.ts # Validación de campos y formato email
│
└── frontend/
    ├── Dockerfile              # Imagen Node 20 Alpine + Vite dev server
    ├── .dockerignore
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx            # Entry point React
        ├── App.tsx             # Router + Layout + CartProvider
        ├── index.css           # Estilos globales (paleta verde/aqua/azul)
        ├── vite-env.d.ts
        ├── types/
        │   └── index.ts        # Mismas interfaces que el backend
        ├── services/
        │   └── api.ts          # Cliente HTTP con ApiError tipado
        ├── store/
        │   └── cartStore.ts    # Context API + useReducer + localStorage
        ├── hooks/
        │   ├── useCart.ts      # Re-export de useCartStore
        │   ├── useGames.ts     # Fetch catálogo con loading/error
        │   └── useCheckout.ts  # Submit orden + manejo errores 400/409/500
        ├── components/
        │   ├── GameCard.tsx        # Tarjeta del catálogo con badge de plataforma
        │   ├── GameCatalog.tsx     # Grid + filtros género/plataforma + búsqueda
        │   ├── GameDetail.tsx      # Vista detalle con todos los atributos
        │   ├── CartIcon.tsx        # Ícono 🛒 con badge de cantidad
        │   ├── CartItem.tsx        # Fila del carrito con controles +/-
        │   ├── CartDrawer.tsx      # Panel lateral animado del carrito
        │   └── CheckoutForm.tsx    # Formulario con validación cliente+servidor
        └── pages/
            ├── HomePage.tsx              # Catálogo principal
            ├── GameDetailPage.tsx        # Detalle de juego por ID
            └── OrderConfirmationPage.tsx # Confirmación de compra
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        HOST                             │
│                                                         │
│   Browser ──────────────────────────────────────────┐  │
│   localhost:3000                                     │  │
└──────────────────────────────────────────────────────┼──┘
                                                       │
┌──────────────────────────────────────────────────────┼──┐
│                   Docker Compose                     │  │
│                                                      │  │
│  ┌─────────────────────────┐    HTTP REST            │  │
│  │  frontend (port 3000)   │◄────────────────────────┘  │
│  │  Vite + React + TS      │                            │
│  │  localStorage (cart)    │──── fetch() ──────────┐   │
│  └─────────────────────────┘                       │   │
│                                                     ▼   │
│  ┌─────────────────────────────────────────────────┐   │
│  │           backend (port 3001)                   │   │
│  │           Express + TypeScript                  │   │
│  │                                                 │   │
│  │  GET  /api/games          GET  /api/games/:id   │   │
│  │  POST /api/orders         GET  /api/orders/:id  │   │
│  │  GET  /img/:filename  (archivos estáticos)      │   │
│  │                                                 │   │
│  │  In-Memory State ──sync write──► data.json      │   │
│  │                                  (volumen)      │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Flujo de datos

1. El backend lee `data.json` al arrancar y mantiene el estado en memoria
2. El frontend obtiene el catálogo vía `GET /api/games`
3. El usuario gestiona el carrito en el cliente (persiste en `localStorage`)
4. Al hacer checkout, el frontend envía `POST /api/orders`
5. El backend valida campos → valida stock → decrementa stock → persiste orden → responde `201`
6. El frontend vacía el carrito y muestra la confirmación con el ID de orden

---

## API Reference

### `GET /api/games`

Retorna todos los juegos del catálogo.

**Response 200:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Elden Ring",
    "description": "...",
    "price": 59.99,
    "genre": "RPG",
    "platform": "PC",
    "imageUrl": "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    "stock": 18
  }
]
```

---

### `GET /api/games/:id`

Retorna un juego por su UUID.

**Response 200:** objeto `Game`
**Response 404:** `{ "error": "Game not found: {id}" }`

---

### `POST /api/orders`

Crea una nueva orden. Valida campos, verifica stock, decrementa inventario y persiste.

**Request body:**
```json
{
  "buyer": {
    "name": "Juan García",
    "email": "juan@ejemplo.com",
    "address": "Calle Falsa 123"
  },
  "items": [
    { "gameId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "quantity": 2 }
  ]
}
```

**Response 201:**
```json
{
  "orderId": "79815496-ae5e-45b0-811b-8f6ad0d9a43c",
  "total": 119.98,
  "createdAt": "2026-04-25T22:23:08.174Z"
}
```

**Errores posibles:**

| Código | Causa |
|--------|-------|
| 400 | Campo faltante o email inválido |
| 409 | Stock insuficiente para algún juego |
| 500 | Error al escribir en `data.json` |

---

### `GET /api/orders/:id`

Retorna una orden completa por su UUID.

**Response 200:** objeto `Order` completo con snapshot de precios
**Response 404:** `{ "error": "Order not found: {id}" }`

---

### `GET /img/:filename`

Sirve imágenes locales almacenadas en `backend/img/`.

**Ejemplo:** `http://localhost:3001/img/zelda.png`

---

## Modelos de datos

### Game
```typescript
interface Game {
  id: string;          // UUID v4
  title: string;
  description: string;
  price: number;       // USD, ej: 59.99
  genre: string;       // "Action" | "RPG" | "Sports" | ...
  platform: string;    // "PC" | "PS5" | "Xbox" | "Nintendo Switch"
  imageUrl: string;    // URL absoluta o http://localhost:3001/img/...
  stock: number;       // entero >= 0
}
```

### Order
```typescript
interface Order {
  id: string;          // UUID v4
  buyer: {
    name: string;
    email: string;
    address: string;
  };
  items: Array<{
    gameId: string;
    gameTitle: string;  // snapshot al momento de la compra
    quantity: number;
    unitPrice: number;  // snapshot al momento de la compra
  }>;
  total: number;        // suma de (unitPrice × quantity)
  createdAt: string;    // ISO 8601
}
```

### DataStore (`data.json`)
```typescript
interface DataStore {
  games: Game[];
  orders: Order[];
}
```

---

## Imágenes locales

Para agregar imágenes propias a los juegos:

1. Copia el archivo de imagen a `backend/img/`
2. En `backend/data.json`, actualiza el campo `imageUrl` del juego:
   ```json
   "imageUrl": "http://localhost:3001/img/nombre-del-archivo.png"
   ```
3. Reinicia el backend para que recargue el JSON:
   ```bash
   docker compose restart backend
   ```

> Las imágenes se sirven como archivos estáticos desde Express en la ruta `/img`.

---

## Comandos útiles

```bash
# Levantar todo (primera vez o tras cambios)
docker compose up --build -d

# Ver logs en tiempo real
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Ver logs solo del frontend
docker compose logs -f frontend

# Reiniciar solo el backend (útil tras editar data.json)
docker compose restart backend

# Detener y eliminar contenedores (conserva data.json)
docker compose down

# Detener, eliminar contenedores Y volúmenes
docker compose down -v

# Ver estado de los contenedores
docker ps

# Acceder a la shell del backend
docker exec -it llm-kiro-backend-1 sh

# Ver el contenido actual del DataStore
cat backend/data.json
```

---

## Proceso de creación

El proyecto fue construido siguiendo una metodología de **Spec-Driven Development** con las siguientes fases documentadas en `.kiro/specs/videogame-store/`.

### Fase 1 — Especificación de requisitos

Se definieron 6 grupos de requisitos funcionales en `requirements.md`:

| # | Requisito | Descripción |
|---|-----------|-------------|
| 1 | Catálogo de Videojuegos | Listado, filtros por género/plataforma, búsqueda por texto, vista de detalle, indicador de stock cero |
| 2 | Gestión del Carrito | Agregar/eliminar ítems, control de cantidades con límite de stock, total calculado, persistencia en localStorage |
| 3 | Proceso de Checkout | Formulario de compra, validación cliente y servidor, manejo de errores 400/409, confirmación con ID de orden |
| 4 | Persistencia JSON | DataStore como archivo JSON, lectura al arrancar, escritura síncrona, reversión ante errores, 10+ juegos iniciales |
| 5 | API REST | 4 endpoints definidos, respuestas JSON, CORS, 404 descriptivos, validación de email |
| 6 | Infraestructura Docker | docker-compose con 2 servicios, puertos 3000/3001, volumen para data.json, hot-reload en frontend |

### Fase 2 — Diseño técnico

Se elaboró `design.md` con:

- **Diagrama de arquitectura** (Mermaid): Browser → React → Express → data.json
- **Decisiones de diseño clave**: DataStore JSON sin base de datos relacional, carrito en localStorage, TypeScript en ambos lados
- **Estructura de componentes** frontend y backend
- **Contrato de la API** con tipos TypeScript
- **17 propiedades de corrección** formales para property-based testing
- **Estrategia de testing** dual: tests de ejemplo + property-based tests con `fast-check`
- **Tabla de errores** por endpoint con códigos HTTP y mensajes exactos

### Fase 3 — Plan de implementación

Se generó `tasks.md` con 17 tareas ordenadas incrementalmente:

```
Tipos compartidos → DataStore → Validadores → OrderService
→ Rutas Express → Servidor → [Checkpoint backend]
→ API client → CartStore → Hooks → Componentes catálogo
→ Componentes carrito → Checkout → Páginas + Router
→ [Checkpoint frontend] → Docker → [Checkpoint final]
```

### Fase 4 — Implementación secuencial

Las tareas se ejecutaron en orden estricto:

**Tarea 1 — Estructura base y tipos compartidos**
- Monorepo con `package.json` workspaces apuntando a `frontend/` y `backend/`
- `tsconfig.json` con modo estricto en ambos lados
- Interfaces TypeScript: `Game`, `CartItem`, `Order`, `DataStore`, `CreateOrderRequest`, `OrderResponse`, `BuyerInfo`

**Tarea 2.1 — DataStore**
- `loadDataStore()`: lectura síncrona de `data.json` con `fs.readFileSync`
- `saveDataStore()`: escritura síncrona con snapshot para rollback ante errores
- `data.json` inicial con 11 juegos cubriendo géneros RPG, Action, Sports, Adventure, Strategy, Puzzle, Racing, Fighting, Simulation, Horror

**Tarea 3.1 — Validador de órdenes**
- `validateOrderRequest()`: valida presencia de `buyer.name`, `buyer.email`, `buyer.address` e `items` no vacíos
- Validación de email con regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Clase `HttpError` con `status`, `message` y `field` opcional

**Tarea 4.1 — OrderService**
- `validateStock()`: verifica stock suficiente, lanza `HttpError(409)` con el juego afectado
- `createOrder()`: decrementa stock exactamente, genera UUID v4, calcula total como `Σ(unitPrice × quantity)`, persiste

**Tareas 5.1–5.4 — Backend Express**
- Middleware CORS configurado para `http://localhost:3000`
- Error handler centralizado que mapea `HttpError` a respuestas JSON
- Rutas `GET /api/games`, `GET /api/games/:id`, `POST /api/orders`, `GET /api/orders/:id`
- `server.ts` con orden correcto de middleware: CORS → JSON → archivos estáticos → rutas → error handler

**Tarea 7.1 — API client frontend**
- `fetchGames()`, `fetchGame()`, `createOrder()`, `fetchOrder()` con `fetch()`
- Clase `ApiError` con `status`, `message` y `field` para mapeo de errores del servidor

**Tarea 8.1 — CartStore**
- Context API + `useReducer` con acciones `ADD_TO_CART`, `REMOVE_FROM_CART`, `UPDATE_QUANTITY`, `CLEAR_CART`
- `addToCart` respeta límite de stock (`Math.min(quantity + 1, game.stock)`)
- Persistencia automática en `localStorage` con clave `videogame-store-cart`
- Carga inicial desde `localStorage` en el inicializador del reducer

**Tareas 9.1–9.3 — Hooks**
- `useGames`: fetch con cancelación via flag `cancelled` para evitar race conditions
- `useCart`: re-export de `useCartStore` como alias
- `useCheckout`: manejo diferenciado de errores 400 (campo específico), 409 (stock), 500 (genérico)

**Tareas 10–13 — Componentes y páginas**
- `GameCard`: imagen con zoom en hover, badge de plataforma, overlay "Sin stock"
- `GameCatalog`: filtros combinados (AND) por género, plataforma y texto
- `GameDetail`: layout de dos columnas con imagen y todos los atributos
- `CartDrawer`: panel lateral con animación `slideIn`, overlay con blur
- `CheckoutForm`: validación cliente antes de enviar, errores de servidor mapeados a campos
- `OrderConfirmationPage`: hero section con resumen completo de la orden
- React Router con rutas `/`, `/games/:id`, `/checkout`, `/orders/:orderId`

**Tarea 15 — Docker**
- `backend/Dockerfile`: Node 20 Alpine, `npm install`, `tsc`, `node dist/server.js`
- `frontend/Dockerfile`: Node 20 Alpine, `npm install`, Vite dev server con `--host 0.0.0.0`
- `docker-compose.yml`: volumen bind mount para `data.json`, `depends_on` frontend→backend

### Fase 5 — Ajustes post-implementación

**Estilos CSS**
- Paleta oscura con variables CSS: verde `#00c896`, aqua `#00e5cc`, azul `#1e90ff`, fondo `#0d1117`
- Glassmorphism en el header, cards con hover lift y glow, drawer con animación slide-in
- Diseño responsivo con breakpoints para móvil (640px) y tablet (768px)
- Spinner animado para estados de carga, estados de error con bordes rojos

**Corrección de imágenes**
- Reemplazo de URLs de Wikipedia (bloqueadas por hotlinking) por Steam CDN: `cdn.cloudflare.steamstatic.com/steam/apps/{appId}/header.jpg`
- Soporte para imágenes locales: Express sirve `backend/img/` como archivos estáticos en `/img`
- URLs locales con formato `http://localhost:3001/img/nombre.png`

**Corrección de build Docker**
- Los archivos `backend/src/middleware/cors.ts` y `errorHandler.ts` no habían sido escritos a disco por el proceso de generación — se recrearon manualmente
- Verificación con `tsc --noEmit` antes de cada rebuild

---

## Tecnologías utilizadas

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend framework | React | 18.2 |
| Frontend lenguaje | TypeScript | 5.3 |
| Frontend bundler | Vite | 5.0 |
| Frontend routing | React Router DOM | 6.21 |
| Backend framework | Express | 4.18 |
| Backend lenguaje | TypeScript | 5.3 |
| Backend runtime | Node.js | 20 (Alpine) |
| UUID generation | uuid | 9.0 |
| Contenedores | Docker + Compose | v2 |
| Testing (unit) | Vitest | 1.2 |
| Testing (property) | fast-check | 3.15 |
| Testing (UI) | React Testing Library | 14.1 |
