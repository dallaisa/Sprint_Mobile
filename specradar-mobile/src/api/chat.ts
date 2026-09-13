import type { ChatResponse } from '@/src/types/api';
import type { Ficha } from '@/src/types/spec';
import { toFicha } from './adapters';
import { API_CONFIGURED, LLM_TIMEOUT_MS, request } from './http';
import { mockChat } from './mocks/servidor';

export interface ChatReply {
  mensagem: string;
  ficha: Ficha | null;
  /** false: a API não identificou o veículo ou falhou por dentro; mensagem traz a dica para o usuário. */
  sucesso: boolean;
}

/** POST /chat/message com o texto do usuário (3 a 500 caracteres). */
export async function sendChatMessage(mensagem: string): Promise<ChatReply> {
  const body = { mensagem: mensagem.trim() };
  const reply = API_CONFIGURED
    ? await request<ChatResponse>('/chat/message', { method: 'POST', body, timeoutMs: LLM_TIMEOUT_MS })
    : await mockChat(body);
  return { ...reply, ficha: reply.ficha ? toFicha(reply.ficha) : null };
}
