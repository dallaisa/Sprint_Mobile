import { useState, useCallback } from 'react';
import { querySpec, HttpError } from '@/src/api/client';
import { saveToHistory } from '@/src/storage/history';
import { SpecQuery, SpecResponse } from '@/src/types/spec';

interface UseSpecQueryResult {
  data: SpecResponse | null;
  loading: boolean;
  error: string | null;
  execute: (query: SpecQuery) => Promise<void>;
  reset: () => void;
}

export function useSpecQuery(): UseSpecQueryResult {
  const [data, setData] = useState<SpecResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (query: SpecQuery) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await querySpec(query);
      setData(result);
      await saveToHistory(result);
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}
