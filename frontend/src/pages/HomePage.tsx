import { useGames } from '../hooks/useGames';
import { GameCatalog } from '../components/GameCatalog';

export function HomePage() {
  const { games, loading, error } = useGames();

  if (loading) {
    return (
      <div className="state-center">
        <div className="spinner" />
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>⚠️ Error al cargar los juegos</p>
        <p style={{ fontSize: '.85rem', marginTop: '.5rem', opacity: .8 }}>{error}</p>
      </div>
    );
  }

  return <GameCatalog games={games} />;
}
