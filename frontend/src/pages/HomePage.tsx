import { useGames } from '../hooks/useGames';
import { GameCatalog } from '../components/GameCatalog';

export function HomePage() {
  const { games, loading, error } = useGames();

  if (loading) {
    return <p>Cargando catálogo...</p>;
  }

  if (error) {
    return <p role="alert" style={{ color: 'red' }}>Error al cargar los juegos: {error}</p>;
  }

  return <GameCatalog games={games} />;
}
