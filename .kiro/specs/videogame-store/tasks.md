# Implementation Plan: Videogame Store

## Overview

Implementación full stack de una tienda de videojuegos con React/TypeScript (frontend), Express/TypeScript (backend), persistencia en archivo JSON (DataStore) y orquestación con Docker Compose. Las tareas siguen un orden incremental: tipos compartidos → backend → frontend → integración Docker.

## Tasks

- [x] 1. Configurar estructura del proyecto y tipos compartidos
  - Crear monorepo con carpetas `frontend/` y `backend/` en la raíz
  - Inicializar `package.json` con workspaces en `frontend/` y `backend/`
  - Crear `backend/tsconfig.json` y `frontend/tsconfig.json` con configuración TypeScript estricta
  - Crear `backend/src/types/index.ts` con interfaces `Game`, `CartItem`, `Order`, `DataStore`, `CreateOrderRequest`, `OrderResponse`, `BuyerInfo`
  - Crear `frontend/src/types/index.ts` con las mismas interfaces del lado cliente
  - _Requirements: 4.1, 5.1_

- [x] 2. Implementar DataStore (backend)
  - [x] 2.1 Crear `backend/src/services/dataStore.ts`
    - Implementar `loadDataStore(): DataStore` que lee `data.json` del sistema de archivos
    - Implementar `saveDataStore(data: DataStore): void` que escribe síncronamente el estado completo al archivo JSON
    - Implementar snapshot en memoria para reversión ante errores de escritura
    - Crear `backend/data.json` con al menos 10 juegos de ejemplo con todos los atributos requeridos (título, descripción, precio, género, plataforma, imageUrl, stock)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Escribir property test para round-trip de persistencia del DataStore
    - **Property 14: Round-trip de persistencia del DataStore**
    - Usar fast-check para generar estados arbitrarios de DataStore y verificar que `saveDataStore` seguido de `loadDataStore` produce un estado idéntico
    - Tag: `// Feature: videogame-store, Property 14: Round-trip de persistencia del DataStore`
    - **Validates: Requirements 4.3**
    - Archivo: `backend/src/__tests__/unit/dataStore.test.ts`

  - [ ]* 2.3 Escribir test de ejemplo para reversión de estado ante error de escritura
    - Simular fallo en escritura del archivo y verificar que el estado en memoria se revierte al snapshot previo y se retorna HTTP 500
    - **Validates: Requirements 4.4**
    - Archivo: `backend/src/__tests__/unit/dataStore.test.ts`

- [x] 3. Implementar validadores de Order (backend)
  - [x] 3.1 Crear `backend/src/validators/orderValidator.ts`
    - Implementar `validateOrderRequest(body: unknown): CreateOrderRequest` que valida presencia de `buyer.name`, `buyer.email`, `buyer.address` e `items` no vacíos
    - Implementar validación de formato de email con regex
    - Lanzar errores tipados con código HTTP y campo afectado para integración con el error handler
    - _Requirements: 3.3, 3.4, 5.5, 5.6_

  - [ ]* 3.2 Escribir property test para validación de campos faltantes
    - **Property 10: La validación de Order rechaza requests con campos faltantes**
    - Usar fast-check para generar combinaciones arbitrarias de campos faltantes y verificar que siempre se retorna HTTP 400 con mensaje descriptivo
    - Tag: `// Feature: videogame-store, Property 10: La validación de Order rechaza requests con campos faltantes`
    - **Validates: Requirements 3.3, 3.4**
    - Archivo: `backend/src/__tests__/unit/orderValidator.test.ts`

  - [ ]* 3.3 Escribir property test para validación de email inválido
    - **Property 17: La validación de email rechaza formatos inválidos**
    - Usar fast-check para generar strings arbitrarios que no sean emails válidos y verificar que se retorna HTTP 400 identificando el campo `email`
    - Tag: `// Feature: videogame-store, Property 17: La validación de email rechaza formatos inválidos`
    - **Validates: Requirements 5.5, 5.6**
    - Archivo: `backend/src/__tests__/unit/orderValidator.test.ts`

- [x] 4. Implementar OrderService (backend)
  - [x] 4.1 Crear `backend/src/services/orderService.ts`
    - Implementar `validateStock(items: OrderItem[], games: Game[]): void` que verifica que el stock de cada Game sea suficiente, lanzando error HTTP 409 con el Game afectado si no lo es
    - Implementar `createOrder(request: CreateOrderRequest, dataStore: DataStore): Order` que decrementa el stock de cada Game exactamente en la cantidad pedida, genera UUID para la Order, calcula el total como suma de `(unitPrice × quantity)` y persiste la Order en el DataStore
    - _Requirements: 3.5, 3.6, 3.7, 3.8_

  - [ ]* 4.2 Escribir property test para validación de stock insuficiente
    - **Property 11: La validación de stock rechaza órdenes con cantidad insuficiente**
    - Usar fast-check para generar Orders donde la cantidad solicitada supera el stock disponible y verificar que se retorna HTTP 409 sin modificar el DataStore
    - Tag: `// Feature: videogame-store, Property 11: La validación de stock rechaza órdenes con cantidad insuficiente`
    - **Validates: Requirements 3.5, 3.6**
    - Archivo: `backend/src/__tests__/unit/orderService.test.ts`

  - [ ]* 4.3 Escribir property test para decremento exacto de stock
    - **Property 12: El procesamiento de Order decrementa el stock exactamente**
    - Usar fast-check para generar Orders válidas y verificar que el stock de cada Game decrementado es exactamente la cantidad pedida, y el stock de Games no incluidos no cambia
    - Tag: `// Feature: videogame-store, Property 12: El procesamiento de Order decrementa el stock exactamente`
    - **Validates: Requirements 3.7**
    - Archivo: `backend/src/__tests__/unit/orderService.test.ts`

  - [ ]* 4.4 Escribir property test para total correcto en respuesta de Order
    - **Property 13: La respuesta de Order exitosa contiene orderId y total correcto**
    - Usar fast-check para generar Orders válidas y verificar que la respuesta contiene `orderId` no vacío y `total` igual a la suma de `(unitPrice × quantity)`
    - Tag: `// Feature: videogame-store, Property 13: La respuesta de Order exitosa contiene orderId y total correcto`
    - **Validates: Requirements 3.8**
    - Archivo: `backend/src/__tests__/unit/orderService.test.ts`

- [x] 5. Implementar rutas y servidor Express (backend)
  - [x] 5.1 Crear `backend/src/middleware/cors.ts` y `backend/src/middleware/errorHandler.ts`
    - Configurar CORS para permitir solicitudes desde el origen del frontend (puerto 3000)
    - Implementar middleware centralizado de errores que transforma errores tipados en respuestas JSON con formato `{ error, field? }` y el código HTTP correspondiente
    - _Requirements: 5.3_

  - [x] 5.2 Crear `backend/src/routes/games.ts`
    - Implementar `GET /api/games` que retorna la lista completa de Games del DataStore en memoria
    - Implementar `GET /api/games/:id` que retorna el Game por ID o HTTP 404 si no existe
    - _Requirements: 1.1, 5.1, 5.4_

  - [x] 5.3 Crear `backend/src/routes/orders.ts`
    - Implementar `POST /api/orders` que orquesta: validar request → validar stock → crear Order → persistir → retornar HTTP 201 con `orderId` y `total`
    - Implementar `GET /api/orders/:id` que retorna la Order por ID o HTTP 404
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1_

  - [x] 5.4 Crear `backend/src/server.ts`
    - Configurar Express con middleware de JSON, CORS y rutas
    - Cargar el DataStore al iniciar el servidor
    - Registrar el error handler como último middleware
    - _Requirements: 4.2, 5.2_

  - [ ]* 5.5 Escribir property test para Content-Type en todas las respuestas
    - **Property 15: Todas las respuestas de la API tienen Content-Type application/json**
    - Usar fast-check para generar requests a distintos endpoints y verificar que todas las respuestas incluyen `Content-Type: application/json`
    - Tag: `// Feature: videogame-store, Property 15: Todas las respuestas de la API tienen Content-Type application/json`
    - **Validates: Requirements 5.2**
    - Archivo: `backend/src/__tests__/unit/orderValidator.test.ts`

  - [ ]* 5.6 Escribir property test para 404 en Game inexistente
    - **Property 16: Solicitud de Game inexistente retorna HTTP 404**
    - Usar fast-check para generar IDs arbitrarios que no existan en el DataStore y verificar que `GET /api/games/:id` retorna HTTP 404 con mensaje descriptivo
    - Tag: `// Feature: videogame-store, Property 16: Solicitud de Game inexistente retorna HTTP 404`
    - **Validates: Requirements 5.4**
    - Archivo: `backend/src/__tests__/integration/games.test.ts`

- [x] 6. Checkpoint — Backend completo
  - Ejecutar `npm test` en `backend/` y verificar que todos los tests pasan
  - Verificar manualmente que `GET /api/games` retorna los 10+ juegos del DataStore
  - Preguntar al usuario si hay dudas antes de continuar con el frontend

- [x] 7. Implementar tipos y servicio API del frontend
  - [x] 7.1 Crear `frontend/src/services/api.ts`
    - Implementar `fetchGames(): Promise<Game[]>` que llama a `GET /api/games`
    - Implementar `fetchGame(id: string): Promise<Game>` que llama a `GET /api/games/:id`
    - Implementar `createOrder(request: CreateOrderRequest): Promise<OrderResponse>` que llama a `POST /api/orders`
    - Implementar `fetchOrder(id: string): Promise<Order>` que llama a `GET /api/orders/:id`
    - Manejar errores de red y respuestas no-2xx lanzando errores tipados con código HTTP y mensaje
    - _Requirements: 3.2, 5.1_

- [x] 8. Implementar estado global del carrito (frontend)
  - [x] 8.1 Crear `frontend/src/store/cartStore.ts`
    - Implementar estado del carrito con Context API o Zustand: `items: CartItem[]`, `total: number`
    - Implementar `addToCart(game: Game)`: añade el Game con cantidad 1 o incrementa en 1 si ya existe, sin superar el stock disponible
    - Implementar `removeFromCart(gameId: string)`: elimina el CartItem y recalcula el total
    - Implementar `updateQuantity(gameId: string, quantity: number)`: actualiza la cantidad sin superar el stock
    - Implementar `clearCart()`: vacía todos los CartItems
    - Implementar persistencia automática en localStorage y carga inicial desde localStorage
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 8.2 Escribir property test para addToCart
    - **Property 4: addToCart incrementa la cantidad correctamente**
    - Usar fast-check para generar estados arbitrarios del carrito y Games con stock disponible, verificar que la cantidad resultante es la anterior + 1 sin modificar otros ítems
    - Tag: `// Feature: videogame-store, Property 4: addToCart incrementa la cantidad correctamente`
    - **Validates: Requirements 2.1**
    - Archivo: `frontend/src/__tests__/hooks/useCart.test.ts`

  - [ ]* 8.3 Escribir property test para total del carrito
    - **Property 5: El total del carrito es la suma exacta de precio por cantidad**
    - Usar fast-check para generar carritos arbitrarios y verificar que `total === sum(item.game.price × item.quantity)`
    - Tag: `// Feature: videogame-store, Property 5: El total del carrito es la suma exacta de precio por cantidad`
    - **Validates: Requirements 2.7, 2.2**
    - Archivo: `frontend/src/__tests__/hooks/useCart.test.ts`

  - [ ]* 8.4 Escribir property test para límite de stock en carrito
    - **Property 6: La cantidad en el carrito no puede superar el stock disponible**
    - Usar fast-check para generar intentos de incremento arbitrarios y verificar que la cantidad resultante nunca supera el stock del Game
    - Tag: `// Feature: videogame-store, Property 6: La cantidad en el carrito no puede superar el stock disponible`
    - **Validates: Requirements 2.3, 2.4**
    - Archivo: `frontend/src/__tests__/hooks/useCart.test.ts`

  - [ ]* 8.5 Escribir property test para removeFromCart
    - **Property 7: removeFromCart elimina el ítem y recalcula el total**
    - Usar fast-check para generar carritos con al menos un ítem, verificar que tras eliminar un ítem ese ítem no aparece y el total es recalculado correctamente
    - Tag: `// Feature: videogame-store, Property 7: removeFromCart elimina el ítem y recalcula el total`
    - **Validates: Requirements 2.5**
    - Archivo: `frontend/src/__tests__/hooks/useCart.test.ts`

  - [ ]* 8.6 Escribir property test para clearCart
    - **Property 8: clearCart produce un carrito vacío con total cero**
    - Usar fast-check para generar carritos arbitrarios y verificar que tras `clearCart` el carrito tiene 0 ítems y total 0
    - Tag: `// Feature: videogame-store, Property 8: clearCart produce un carrito vacío con total cero`
    - **Validates: Requirements 2.6**
    - Archivo: `frontend/src/__tests__/hooks/useCart.test.ts`

  - [ ]* 8.7 Escribir property test para round-trip de localStorage
    - **Property 9: Round-trip de persistencia del carrito en localStorage**
    - Usar fast-check para generar estados arbitrarios del carrito, serializar a localStorage y deserializar, verificar que el carrito resultante es idéntico al original
    - Tag: `// Feature: videogame-store, Property 9: Round-trip de persistencia del carrito en localStorage`
    - **Validates: Requirements 2.8**
    - Archivo: `frontend/src/__tests__/hooks/useCart.test.ts`

- [x] 9. Implementar hooks del frontend
  - [x] 9.1 Crear `frontend/src/hooks/useGames.ts`
    - Implementar hook que llama a `api.fetchGames()` al montar, expone `games`, `loading` y `error`
    - _Requirements: 1.1, 1.2_

  - [x] 9.2 Crear `frontend/src/hooks/useCart.ts`
    - Implementar hook que expone el estado del carrito y las acciones (`addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`) desde `cartStore`
    - _Requirements: 2.1, 2.3, 2.5, 2.6_

  - [x] 9.3 Crear `frontend/src/hooks/useCheckout.ts`
    - Implementar hook que gestiona el estado del formulario de checkout, llama a `api.createOrder()`, maneja errores HTTP 400/409/500 y expone `submit`, `loading`, `error` y `orderId`
    - _Requirements: 3.1, 3.2, 3.9_

- [x] 10. Implementar componentes del catálogo (frontend)
  - [x] 10.1 Crear `frontend/src/components/GameCard.tsx`
    - Renderizar título, imagen, precio, género y plataforma del Game
    - Mostrar botón "Agregar al carrito" habilitado si `stock > 0`, o indicador "Sin stock" y botón deshabilitado si `stock === 0`
    - _Requirements: 1.2, 1.6_

  - [ ]* 10.2 Escribir property test para GameCard con stock cero
    - **Property 2: Juego con stock cero muestra estado deshabilitado**
    - Usar fast-check para generar Games con `stock === 0` y `stock > 0`, verificar que el botón está deshabilitado/habilitado respectivamente y el indicador "Sin stock" aparece/no aparece
    - Tag: `// Feature: videogame-store, Property 2: Juego con stock cero muestra estado deshabilitado`
    - **Validates: Requirements 1.6**
    - Archivo: `frontend/src/__tests__/components/GameCard.test.tsx`

  - [x] 10.3 Crear `frontend/src/components/GameDetail.tsx`
    - Renderizar todos los atributos del Game: título, descripción, precio, género, plataforma, imagen y stock disponible
    - _Requirements: 1.5_

  - [ ]* 10.4 Escribir property test para GameDetail
    - **Property 3: Vista de detalle contiene todos los atributos del juego**
    - Usar fast-check para generar objetos Game válidos y verificar que el componente renderizado contiene todos los atributos requeridos
    - Tag: `// Feature: videogame-store, Property 3: Vista de detalle contiene todos los atributos del juego`
    - **Validates: Requirements 1.5**
    - Archivo: `frontend/src/__tests__/components/GameCard.test.tsx`

  - [x] 10.5 Crear `frontend/src/components/GameCatalog.tsx`
    - Renderizar el grid de `GameCard` con todos los Games
    - Implementar filtros por género y plataforma (select/dropdown)
    - Implementar campo de búsqueda por texto (case-insensitive sobre el título)
    - Aplicar filtros de forma combinada sobre la lista de Games
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 10.6 Escribir property test para filtrado del catálogo
    - **Property 1: Filtrado del catálogo preserva solo juegos que cumplen el criterio**
    - Usar fast-check para generar listas arbitrarias de Games y criterios de filtrado, verificar que todos los Games en el resultado cumplen el criterio y ningún Game que cumple el criterio es excluido
    - Tag: `// Feature: videogame-store, Property 1: Filtrado del catálogo preserva solo juegos que cumplen el criterio`
    - **Validates: Requirements 1.3, 1.4**
    - Archivo: `frontend/src/__tests__/components/GameCatalog.test.tsx`

- [x] 11. Implementar componentes del carrito (frontend)
  - [x] 11.1 Crear `frontend/src/components/CartIcon.tsx`
    - Renderizar ícono de carrito con badge que muestra el número total de ítems cuando el carrito tiene al menos un ítem
    - _Requirements: 2.2_

  - [x] 11.2 Crear `frontend/src/components/CartItem.tsx`
    - Renderizar ítem del carrito con título, precio unitario, cantidad y subtotal
    - Incluir controles para incrementar/decrementar cantidad (respetando límite de stock) y botón para eliminar el ítem
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 11.3 Crear `frontend/src/components/CartDrawer.tsx`
    - Renderizar panel lateral con la lista de `CartItem`, el total del carrito y botón "Vaciar carrito"
    - Incluir botón para proceder al checkout
    - _Requirements: 2.5, 2.6, 2.7_

- [x] 12. Implementar formulario de checkout y confirmación (frontend)
  - [x] 12.1 Crear `frontend/src/components/CheckoutForm.tsx`
    - Renderizar formulario con campos: nombre completo, correo electrónico y dirección de envío
    - Validar campos en el cliente antes de enviar
    - Mostrar errores de validación del servidor (HTTP 400) en los campos correspondientes
    - Mostrar alerta con el juego afectado ante error HTTP 409
    - _Requirements: 3.1, 3.2_

  - [ ]* 12.2 Escribir test de ejemplo para CheckoutForm
    - Verificar que el formulario renderiza los tres campos requeridos (nombre, email, dirección)
    - Verificar que al enviar el formulario válido se llama a `POST /api/orders` con los datos correctos
    - **Validates: Requirements 3.1, 3.2**
    - Archivo: `frontend/src/__tests__/components/CheckoutForm.test.tsx`

- [x] 13. Implementar páginas y routing (frontend)
  - [x] 13.1 Crear `frontend/src/pages/HomePage.tsx`
    - Componer `GameCatalog` con `useGames` para mostrar el catálogo completo con filtros
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 13.2 Crear `frontend/src/pages/GameDetailPage.tsx`
    - Obtener el `id` de la URL, llamar a `api.fetchGame(id)` y renderizar `GameDetail`
    - _Requirements: 1.5_

  - [x] 13.3 Crear `frontend/src/pages/OrderConfirmationPage.tsx`
    - Mostrar número de Order y resumen de la compra tras checkout exitoso
    - _Requirements: 3.9_

  - [x] 13.4 Configurar React Router en `frontend/src/App.tsx`
    - Definir rutas: `/` → `HomePage`, `/games/:id` → `GameDetailPage`, `/orders/:id` → `OrderConfirmationPage`
    - Integrar `CartDrawer` y `CartIcon` en el layout principal
    - _Requirements: 1.2, 1.5, 3.9_

  - [ ]* 13.5 Escribir test de ejemplo para flujo de confirmación de Order
    - Verificar que tras recibir confirmación de la API el carrito se vacía y se muestra la pantalla de confirmación con el número de Order
    - **Validates: Requirements 3.9**
    - Archivo: `frontend/src/__tests__/hooks/useCheckout.test.ts`

- [x] 14. Checkpoint — Frontend completo
  - Ejecutar `npm test` en `frontend/` y verificar que todos los tests pasan
  - Verificar que el carrito persiste en localStorage al recargar la página
  - Preguntar al usuario si hay dudas antes de continuar con Docker

- [x] 15. Configurar infraestructura Docker
  - [x] 15.1 Crear `backend/Dockerfile`
    - Imagen base Node.js, instalar dependencias, compilar TypeScript, exponer puerto 3001
    - _Requirements: 6.1, 6.3_

  - [x] 15.2 Crear `frontend/Dockerfile`
    - Imagen base Node.js con Vite, instalar dependencias, exponer puerto 3000 con soporte de hot-reload
    - _Requirements: 6.1, 6.4, 6.6_

  - [x] 15.3 Crear `docker-compose.yml` en la raíz
    - Definir servicio `backend` en puerto 3001 con volumen para `data.json` (persistencia entre reinicios)
    - Definir servicio `frontend` en puerto 3000 con dependencia en `backend`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 16. Tests de integración (backend)
  - [ ]* 16.1 Escribir tests de integración para GET /api/games
    - Verificar que `GET /api/games` retorna todos los juegos del DataStore con status 200
    - Verificar que el DataStore se carga en memoria al iniciar el servidor
    - Verificar que el DataStore inicial contiene al menos 10 juegos
    - **Validates: Requirements 1.1, 4.2, 4.5**
    - Archivo: `backend/src/__tests__/integration/games.test.ts`

  - [ ]* 16.2 Escribir tests de integración para POST /api/orders
    - Verificar flujo completo: Order válida → HTTP 201 con orderId y total → stock decrementado en DataStore
    - Verificar headers CORS presentes en todas las respuestas
    - **Validates: Requirements 3.2, 3.7, 3.8, 5.3**
    - Archivo: `backend/src/__tests__/integration/orders.test.ts`

- [x] 17. Checkpoint final — Verificar integración completa
  - Ejecutar todos los tests (`npm test` en `backend/` y `frontend/`)
  - Verificar que `docker compose up --build -d` levanta ambos servicios sin errores
  - Verificar que el frontend en `localhost:3000` consume correctamente la API en `localhost:3001`
  - Preguntar al usuario si hay dudas o ajustes finales

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los property tests usan fast-check con mínimo 100 iteraciones por propiedad
- Los checkpoints en las tareas 6, 14 y 17 aseguran validación incremental
- El DataStore en memoria se carga al iniciar el backend y se escribe síncronamente en cada mutación
