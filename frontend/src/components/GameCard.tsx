import { Link } from 'react-router-dom';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  onAddToCart: (game: Game) => void;
}

export function GameCard({ game, onAddToCart }: GameCardProps) {
  const inStock = game.stock > 0;

  return (
    <div className="game-card">
      <div className="game-card-img-wrap">
        <img className="game-card-img" src={game.imageUrl} alt={game.title} />
        <span className="game-card-badge">{game.platform}</span>
        {!inStock && <div className="game-card-out-badge">Sin stock</div>}
      </div>

      <div className="game-card-body">
        <Link to={`/games/${game.id}`}>
          <h3 className="game-card-title">{game.title}</h3>
        </Link>

        <div className="game-card-meta">
          <span className="tag tag-genre">{game.genre}</span>
        </div>

        <div className="game-card-footer">
          <span className="game-price">${game.price.toFixed(2)}</span>
          <button
            className="btn btn-primary btn-sm"
            disabled={!inStock}
            onClick={() => onAddToCart(game)}
          >
            {inStock ? '+ Carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
}
