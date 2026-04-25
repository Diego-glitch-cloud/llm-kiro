import { useState } from 'react';
import type { Game } from '../types';
import { useCart } from '../hooks/useCart';
import { GameCard } from './GameCard';

interface GameCatalogProps {
  games: Game[];
}

export function GameCatalog({ games }: GameCatalogProps) {
  const [genreFilter, setGenreFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const { addToCart } = useCart();

  const genres = Array.from(new Set(games.map((g) => g.genre)));
  const platforms = Array.from(new Set(games.map((g) => g.platform)));

  const filtered = games.filter((g) => {
    if (genreFilter && g.genre !== genreFilter) return false;
    if (platformFilter && g.platform !== platformFilter) return false;
    if (searchText && !g.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Buscar por título"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="">Todos los géneros</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="">Todas las plataformas</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>
      </div>
      <div>
        {filtered.map((game) => (
          <GameCard key={game.id} game={game} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}
