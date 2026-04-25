# Requirements Document

## Introduction

Videogame Store es una aplicación web full stack de e-commerce para la venta de videojuegos. El sistema permite a los usuarios explorar un catálogo de videojuegos, gestionar un carrito de compras y completar el proceso de compra. El frontend está construido con React y TypeScript, el backend con Express y TypeScript, los datos se persisten en un archivo JSON, y toda la aplicación se orquesta con Docker Compose.

## Glossary

- **Store**: La aplicación web completa de venta de videojuegos.
- **Catalog**: El conjunto de videojuegos disponibles para la venta.
- **Game**: Un videojuego listado en el catálogo con sus atributos (título, descripción, precio, género, plataforma, imagen, stock).
- **Cart**: El carrito de compras temporal asociado a la sesión del usuario.
- **CartItem**: Un elemento dentro del carrito que referencia un Game y una cantidad.
- **Order**: Un pedido completado que contiene los CartItems, el total y los datos del comprador.
- **User**: Una persona que navega y realiza compras en la Store.
- **API**: El backend Express que expone los endpoints REST.
- **DataStore**: El archivo JSON que actúa como base de datos persistente.
- **Frontend**: La aplicación React que el User interactúa directamente.
- **Backend**: El servidor Express que gestiona la lógica de negocio y acceso al DataStore.

---

## Requirements

### Requirement 1: Catálogo de Videojuegos

**User Story:** Como User, quiero explorar el catálogo de videojuegos disponibles, para poder descubrir y seleccionar los juegos que deseo comprar.

#### Acceptance Criteria

1. THE API SHALL exponer un endpoint `GET /api/games` que retorne la lista completa de Games del DataStore.
2. WHEN el User accede a la página principal, THE Frontend SHALL mostrar todos los Games disponibles en el Catalog con título, imagen, precio, género y plataforma.
3. WHEN el User aplica un filtro por género o plataforma, THE Frontend SHALL mostrar únicamente los Games que coincidan con el filtro seleccionado.
4. WHEN el User ingresa texto en el campo de búsqueda, THE Frontend SHALL filtrar los Games cuyo título contenga el texto ingresado, sin distinguir mayúsculas de minúsculas.
5. WHEN el User selecciona un Game del Catalog, THE Frontend SHALL mostrar una vista de detalle con todos los atributos del Game incluyendo descripción completa y stock disponible.
6. IF el stock de un Game es 0, THEN THE Frontend SHALL mostrar el Game como "Sin stock" y deshabilitar el botón de agregar al carrito.

---

### Requirement 2: Gestión del Carrito de Compras

**User Story:** Como User, quiero agregar y gestionar videojuegos en mi carrito de compras, para poder preparar mi pedido antes de realizar el pago.

#### Acceptance Criteria

1. WHEN el User hace clic en "Agregar al carrito" en un Game con stock disponible, THE Frontend SHALL añadir el Game al Cart con cantidad 1, o incrementar la cantidad en 1 si el Game ya existe en el Cart.
2. WHILE el Cart contiene al menos un CartItem, THE Frontend SHALL mostrar el número total de ítems en el ícono del carrito.
3. WHEN el User incrementa la cantidad de un CartItem, THE Frontend SHALL actualizar la cantidad siempre que no supere el stock disponible del Game.
4. IF el User intenta agregar una cantidad que supera el stock disponible del Game, THEN THE Frontend SHALL mostrar un mensaje de error indicando el stock máximo disponible.
5. WHEN el User elimina un CartItem del Cart, THE Frontend SHALL remover el ítem y recalcular el total del Cart.
6. WHEN el User hace clic en "Vaciar carrito", THE Frontend SHALL eliminar todos los CartItems del Cart.
7. THE Frontend SHALL calcular y mostrar el precio total del Cart como la suma de (precio × cantidad) de cada CartItem.
8. THE Frontend SHALL persistir el estado del Cart en el almacenamiento local del navegador (localStorage) para que sobreviva a recargas de página.

---

### Requirement 3: Proceso de Compra (Checkout)

**User Story:** Como User, quiero completar la compra de los videojuegos en mi carrito, para poder recibir mi pedido.

#### Acceptance Criteria

1. WHEN el User inicia el proceso de checkout, THE Frontend SHALL mostrar un formulario solicitando nombre completo, correo electrónico y dirección de envío.
2. WHEN el User envía el formulario de checkout con todos los campos válidos, THE Frontend SHALL enviar una solicitud `POST /api/orders` al API con los datos del Cart y del comprador.
3. THE API SHALL validar que todos los campos requeridos (nombre, correo, dirección, CartItems) estén presentes en la solicitud de Order.
4. IF algún campo requerido está ausente o el Cart está vacío, THEN THE API SHALL retornar un error HTTP 400 con un mensaje descriptivo.
5. WHEN el API recibe una Order válida, THE API SHALL verificar que el stock de cada Game en el Cart sea suficiente para cubrir la cantidad solicitada.
6. IF el stock de algún Game es insuficiente al momento de procesar la Order, THEN THE API SHALL retornar un error HTTP 409 indicando el Game con stock insuficiente.
7. WHEN el API confirma que el stock es suficiente, THE API SHALL decrementar el stock de cada Game en el DataStore según las cantidades de la Order.
8. WHEN el API persiste la Order exitosamente en el DataStore, THE API SHALL retornar HTTP 201 con el identificador único de la Order y el total calculado.
9. WHEN el Frontend recibe la confirmación de la Order, THE Frontend SHALL vaciar el Cart y mostrar una pantalla de confirmación con el número de Order y el resumen de la compra.

---

### Requirement 4: Persistencia de Datos con Archivo JSON

**User Story:** Como desarrollador, quiero que los datos de la aplicación se persistan en un archivo JSON, para poder operar sin una base de datos relacional.

#### Acceptance Criteria

1. THE DataStore SHALL ser un archivo JSON que contenga dos colecciones: `games` (array de Game) y `orders` (array de Order).
2. THE API SHALL leer el DataStore desde el sistema de archivos al iniciar y mantener una copia en memoria durante la ejecución.
3. WHEN el API modifica datos (crear Order, actualizar stock), THE API SHALL escribir el estado actualizado completo al archivo JSON del DataStore de forma síncrona antes de retornar la respuesta.
4. IF ocurre un error al escribir en el DataStore, THEN THE API SHALL retornar un error HTTP 500 y revertir los cambios en memoria.
5. THE DataStore SHALL incluir al menos 10 Games de ejemplo con datos completos (título, descripción, precio, género, plataforma, imagen URL, stock) al inicializar la aplicación por primera vez.

---

### Requirement 5: API REST del Backend

**User Story:** Como desarrollador, quiero que el backend exponga una API REST bien definida, para que el frontend pueda consumir los datos de forma predecible.

#### Acceptance Criteria

1. THE API SHALL exponer los siguientes endpoints: `GET /api/games`, `GET /api/games/:id`, `POST /api/orders`, `GET /api/orders/:id`.
2. THE API SHALL retornar todas las respuestas en formato JSON con el header `Content-Type: application/json`.
3. WHEN el Frontend realiza una solicitud al API, THE API SHALL incluir los headers CORS necesarios para permitir solicitudes desde el origen del Frontend.
4. IF el User solicita un Game con un `:id` que no existe en el DataStore, THEN THE API SHALL retornar HTTP 404 con un mensaje de error descriptivo.
5. THE API SHALL validar el formato del correo electrónico en las solicitudes de Order antes de procesarlas.
6. IF el correo electrónico en la solicitud de Order tiene un formato inválido, THEN THE API SHALL retornar HTTP 400 con un mensaje indicando el campo inválido.

---

### Requirement 6: Infraestructura con Docker

**User Story:** Como desarrollador, quiero que la aplicación se ejecute completamente en contenedores Docker, para poder desplegarla con un único comando.

#### Acceptance Criteria

1. THE Store SHALL incluir un archivo `docker-compose.yml` que defina los servicios de Frontend y Backend.
2. WHEN el desarrollador ejecuta `docker compose up --build -d`, THE Store SHALL construir y levantar ambos servicios (Frontend y Backend) en modo detached sin errores.
3. THE Backend SHALL estar disponible en el puerto 3001 del host después de ejecutar `docker compose up --build -d`.
4. THE Frontend SHALL estar disponible en el puerto 3000 del host después de ejecutar `docker compose up --build -d`.
5. THE Backend SHALL montar el archivo JSON del DataStore como un volumen Docker para que los datos persistan entre reinicios del contenedor.
6. WHERE el entorno de desarrollo requiera recarga automática, THE Frontend SHALL soportar hot-reload dentro del contenedor Docker.
