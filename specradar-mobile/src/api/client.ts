import { SpecQuery, SpecResponse, ApiError } from '@/src/types/spec';
import { SpecApiResponse } from '@/src/types/api';
import { TokenResponse, RegisterRequest } from '@/src/types/auth';
import { rangerRaptorMock } from './mocks/ranger-raptor';
import { mockLogin, mockRegister } from './mocks/auth';
import { getToken } from '@/src/storage/auth';
import { toSpecResponse, toApiError, slugVeiculo, ApiErrorNormalizado } from './adapters';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const USE_MOCK = !BASE_URL;
const TIMEOUT_MS = 15000;

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    /**
     * Corpo do erro já normalizado, quando o backend mandou um. Carrega
     * campos_invalidos e sugestoes_similares — hoje ninguém renderiza os
     * dois, é a Fase 4 que passa a usá-los.
     */
    public detalhes?: ApiErrorNormalizado
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new HttpError(503, 'Tempo limite excedido (15s). Verifique sua conexão.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Monta o HttpError de uma resposta com falha, preferindo a mensagem do
 * backend quando ela existe. `errMap` continua como fallback: os 401/403
 * do SecurityConfig trazem mensagem genérica, e um corpo não-JSON (HTML
 * de proxy, resposta vazia) não traz nada.
 */
async function erroDaResposta(
  response: Response,
  errMap: Record<number, string>
): Promise<HttpError> {
  let corpo: unknown = null;
  try {
    corpo = await response.json();
  } catch {
    // corpo vazio ou não-JSON — segue com o fallback
  }

  const detalhes = toApiError(corpo, response.status);
  const mensagem =
    detalhes.mensagem || errMap[response.status] || `Erro ${response.status}.`;

  return new HttpError(response.status, mensagem, detalhes);
}

export async function loginUser(email: string, senha: string): Promise<TokenResponse> {
  if (USE_MOCK) return mockLogin(email, senha);

  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    throw await erroDaResposta(response, {
      401: 'E-mail ou senha incorretos.',
      429: 'Muitas tentativas. Tente novamente em instantes.',
    });
  }

  // ATENÇÃO — dívida conhecida, resolvida na Fase 3: o backend devolve
  // AuthApiResponse ({access_token, refresh_token, expires_in, role}) e
  // este cast afirma TokenResponse ({token, tipo, expiraEm}). Contra a API
  // real, o login grava undefined. Não foi corrigido aqui porque o conserto
  // é indissociável de storage/auth.ts e do fluxo de refresh, que são da
  // Fase 3 inteira. O modo mock não é afetado.
  return response.json() as Promise<TokenResponse>;
}

export async function registerUser(data: RegisterRequest): Promise<void> {
  if (USE_MOCK) {
    await mockRegister(data.nome, data.email, data.senha);
    return;
  }

  const headers = await authHeaders();
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await erroDaResposta(response, {
      400: 'Dados inválidos. Verifique os campos.',
      401: 'Não autorizado.',
      409: 'E-mail já cadastrado.',
    });
  }
}

export async function querySpec(query: SpecQuery): Promise<SpecResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const versao = query.versao ?? rangerRaptorMock.versao;
    return {
      ...rangerRaptorMock,
      // Mesma regra de id do caminho real. Antes havia um Date.now() aqui,
      // o que fazia toda consulta do mesmo veículo virar entrada nova no
      // histórico — o dedupe de storage/history.ts nunca chegava a agir.
      id: slugVeiculo(query.marca, query.modelo, versao),
      marca: query.marca,
      modelo: query.modelo,
      versao,
      consultado_em: new Date().toISOString(),
    };
  }

  const headers = await authHeaders();
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/specs/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw await erroDaResposta(response, {
      401: 'Não autorizado. Faça login novamente.',
      404: 'Veículo não encontrado na base de dados.',
      422: 'Dados inválidos. Verifique marca e modelo.',
      503: 'Serviço indisponível. Tente novamente em instantes.',
    });
  }

  const api = (await response.json()) as SpecApiResponse;
  return toSpecResponse(api);
}

export type { ApiError };
