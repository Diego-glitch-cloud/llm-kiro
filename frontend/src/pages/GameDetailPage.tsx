import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Game } from '../types';
import { fetchGame } from '../services/api';
import { GameDetail } from '../components/GameDetail';
import { useCart } from '../hooks/useCart';

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchGame(id)
      .then((data) => {
        if (!cancelled) setGame(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p>Cargando juego...</p>;
  if (error) return <p role="alert" style={{ color: 'red' }}>Error: {error}</p>;
  if (!game) return <p>Juego no encontrado.</p>;

  return <GameDetail game={game} onAddToCart={addToCart} />;
}
