import type { Game } from '../types';

interface GameDetailProps {
  game: Game;
  onAddToCart: (game: Game) => void;
}

export function GameDetail({ game, onAddToCart }: GameDetailProps) {
  const inStock = game.stock > 0;

  return (
    <div>
      <img src={game.imageUrl} alt={game.title} />
      <h1>{game.title}</h1>
      <p>{game.description}</p>
      <p>${game.price.toFixed(2)}</p>
      <p>{game.genre}</p>
      <p>{game.platform}</p>
      <p>Stock disponible: {game.stock}</p>
      {inStock ? (
        <button onClick={() => onAddToCart(game)}>Agregar al carrito</button>
      ) : (
        <span>Sin stock</span>
      )}
    </div>
  );
}
