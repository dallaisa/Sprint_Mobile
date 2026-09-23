import { useState, useCallback, useRef } from 'react';
import { querySpec } from '@/src/api/specs';
import { ApiError, newIdempotencyKey } from '@/src/api/http';
import { saveToHistory } from '@/src/storage/history';
import type { SpecQueryRequest } from '@/src/types/api';
import type { Ficha } from '@/src/types/spec';

interface UseSpecQueryResult {
  data: Ficha | null;
  loading: boolean;
  error: string | null;
  /** Mensagens da API por campo (marca, modelo, versao, atributos) quando ela recusa os dados. */
  camposInvalidos: Record<string, string>;
  execute: (query: SpecQueryRequest) => Promise<void>;
  /** Repete a última consulta com a mesma Idempotency-Key. */
  retry: () => Promise<void>;
  reset: () => void;
}

function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Erro inesperado. Tente novamente.';
  if (error.codigo === 'VALIDATION_ERROR') return 'A API recusou os dados. Revise os campos destacados.';
  return error.message;
}

export function useSpecQuery(): UseSpecQueryResult {
  const [data, setData] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [camposInvalidos, setCamposInvalidos] = useState<Record<string, string>>({});
  const last = useRef<{ query: SpecQueryRequest; key: string } | null>(null);

  const run = useCallback(async (query: SpecQueryRequest, key: string) => {
    last.current = { query, key };
    setLoading(true);
    setError(null);
    setCamposInvalidos({});
    setData(null);
    try {
      const result = await querySpec(query, { idempotencyKey: key });
      setData(result);
      await saveToHistory(result);
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError) setCamposInvalidos(err.camposInvalidos);
    } finally {
      setLoading(false);
    }
  }, []);

  const execute = useCallback((query: SpecQueryRequest) => run(query, newIdempotencyKey()), [run]);

  const retry = useCallback(async () => {
    if (last.current) await run(last.current.query, last.current.key);
  }, [run]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setCamposInvalidos({});
  }, []);

  return { data, loading, error, camposInvalidos, execute, retry, reset };
}
