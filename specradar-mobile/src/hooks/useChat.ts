import { useCallback, useState } from 'react';
import { sendChatMessage, type ChatReply } from '@/src/api/chat';
import { ApiError } from '@/src/api/http';
import { saveToHistory } from '@/src/storage/history';

interface UseChatResult {
  /** Resposta da API; com sucesso false, a mensagem é a dica do assistente (não é erro). */
  reply: ChatReply | null;
  loading: boolean;
  /** Falha de rede, sessão, limite ou validação. */
  error: string | null;
  send: (mensagem: string) => Promise<void>;
  reset: () => void;
}

export function useChat(): UseChatResult {
  const [reply, setReply] = useState<ChatReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (mensagem: string) => {
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const result = await sendChatMessage(mensagem);
      setReply(result);
      if (result.ficha) await saveToHistory(result.ficha);
    } catch (err) {
      if (err instanceof ApiError) setError(Object.values(err.camposInvalidos)[0] ?? err.message);
      else setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setReply(null);
    setError(null);
  }, []);

  return { reply, loading, error, send, reset };
}
