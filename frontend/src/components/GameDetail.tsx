import { Link } from 'react-router-dom';
import type { Game } from '../types';

interface GameDetailProps {
  game: Game;
  onAddToCart: (game: Game) => void;
}

export function GameDetail({ game, onAddToCart }: GameDetailProps) {
  const inStock = game.stock > 0;

  return (
    <div>
      <Link to="/" className="detail-back">← Volver al catálogo</Link>

      <div className="detail-layout">
        <div className="detail-img-wrap">
          <img className="detail-img" src={game.imageUrl} alt={game.title} />
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{game.title}</h1>

          <div className="detail-tags">
            <span className="tag tag-genre">{game.genre}</span>
            <span className="tag tag-platform">{game.platform}</span>
          </div>

          <p className="detail-description">{game.description}</p>

          <div className="detail-price-row">
            <span className="detail-price">${game.price.toFixed(2)}</span>
            <span className={`detail-stock ${!inStock ? 'detail-stock-zero' : ''}`}>
              Stock: <strong>{game.stock} unidades</strong>
            </span>
          </div>

          {inStock ? (
            <button className="btn btn-primary" onClick={() => onAddToCart(game)}>
              🛒 Agregar al carrito
            </button>
          ) : (
            <div className="out-of-stock-banner">
              ⚠️ Este juego está agotado actualmente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
