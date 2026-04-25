import { useState, useEffect } from 'react';
import type { Game } from '../types';
import { fetchGames } from '../services/api';

export function useGames(): { games: Game[]; loading: boolean; error: string | null } {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchGames()
      .then((data) => {
        if (!cancelled) {
          setGames(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { games, loading, error };
}
