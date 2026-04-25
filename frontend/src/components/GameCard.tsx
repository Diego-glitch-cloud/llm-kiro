import { Link } from 'react-router-dom';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  onAddToCart: (game: Game) => void;
}

export function GameCard({ game, onAddToCart }: GameCardProps) {
  const inStock = game.stock > 0;

  return (
    <div>
      <Link to={`/games/${game.id}`}>
        <img src={game.imageUrl} alt={game.title} />
        <h3>{game.title}</h3>
      </Link>
      <p>${game.price.toFixed(2)}</p>
      <p>{game.genre}</p>
      <p>{game.platform}</p>
      {!inStock && <span>Sin stock</span>}
      <button disabled={!inStock} onClick={() => onAddToCart(game)}>
        Agregar al carrito
      </button>
    </div>
  );
}
