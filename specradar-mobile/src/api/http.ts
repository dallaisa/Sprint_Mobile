import { Platform } from 'react-native';
import type { AuthResponse, CodigoErro, ErrorResponse } from '@/src/types/api';
import { endSession, getSession, updateSessionTokens } from '@/src/storage/session';

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

/** Sem URL configurada, os módulos da API respondem com os mocks. */
export const API_CONFIGURED = BASE_URL.length > 0;
export const API_BASE_URL = BASE_URL;

export const DEFAULT_TIMEOUT_MS = 15_000;
/** Consulta e chat podem chamar o Gemini, que tem timeout de 60 s no servidor. */
export const LLM_TIMEOUT_MS = 75_000;

/** Renova o access token quando faltar menos que isso para ele vencer. */
const RENEW_MARGIN_MS = 60_000;

export type ApiErrorCode = CodigoErro | 'NETWORK_ERROR' | 'TIMEOUT' | 'SESSION_EXPIRED' | 'UNKNOWN';

export class ApiError extends Error {
  /** 0 quando não houve resposta (rede ou timeout). */
  readonly status: number;
  readonly codigo: ApiErrorCode;
  /** Campo → mensagem, nos 422. */
  readonly camposInvalidos: Record<string, string>;
  /** Fichas parecidas, no 404 de ficha. */
  readonly sugestoes: string[];
  /** Segundos até poder tentar de novo, nos 429. */
  readonly retryAfter: number | null;

  constructor(
    status: number,
    codigo: ApiErrorCode,
    message: string,
    details: { camposInvalidos?: Record<string, string>; sugestoes?: string[]; retryAfter?: number | null } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.camposInvalidos = details.camposInvalidos ?? {};
    this.sugestoes = details.sugestoes ?? [];
    this.retryAfter = details.retryAfter ?? null;
  }
}

type QueryValue = string | number | string[] | undefined;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Envia o access token e renova a sessão quando preciso (padrão: true). */
  auth?: boolean;
  timeoutMs?: number;
  /** Enviado só no Android e no iOS: o CORS da API não libera esse header na web. */
  idempotencyKey?: string;
}

/** Chave para o header Idempotency-Key: gere uma por ação do usuário e reaproveite nas novas tentativas. */
export function newIdempotencyKey(): string {
  const random = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${random()}-${random()}`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const auth = options.auth ?? true;
  let token = auth ? await validAccessToken() : null;
  let response = await send(path, options, token);

  if (auth && response.status === 401 && token) {
    token = await tokenAfterUnauthorized(token);
    response = await send(path, options, token);
    if (response.status === 401) {
      await endSession('expired');
      throw sessionExpired();
    }
  }
  return readResponse<T>(response);
}

let renewal: Promise<string> | null = null;

/**
 * Troca o refresh token por um par novo. A API invalida o refresh token no
 * primeiro uso, então chamadas simultâneas compartilham a mesma troca.
 */
export function renewSession(): Promise<string> {
  if (!renewal) renewal = doRenew().finally(() => { renewal = null; });
  return renewal;
}

async function doRenew(): Promise<string> {
  const session = await getSession();
  if (!session) throw sessionExpired();

  const response = await send('/auth/refresh', { method: 'POST', body: { refreshToken: session.refreshToken } }, null);
  if (!response.ok) {
    // 401/422: refresh token vencido, inválido ou já usado. Rede, 429 e 5xx não derrubam a sessão.
    if (response.status === 401 || response.status === 422) {
      await endSession('expired');
      throw sessionExpired();
    }
    throw await toApiError(response);
  }

  const updated = await updateSessionTokens(await readResponse<AuthResponse>(response));
  if (!updated) throw sessionExpired();
  return updated.accessToken;
}

async function validAccessToken(): Promise<string> {
  const session = await getSession();
  if (!session) throw sessionExpired();
  if (session.accessExpiresAt - Date.now() > RENEW_MARGIN_MS) return session.accessToken;
  return renewSession();
}

async function tokenAfterUnauthorized(usedToken: string): Promise<string> {
  const session = await getSession();
  if (!session) throw sessionExpired();
  // Outra chamada já renovou enquanto esta estava em andamento.
  if (session.accessToken !== usedToken) return session.accessToken;
  return renewSession();
}

function sessionExpired(): ApiError {
  return new ApiError(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.');
}

function buildUrl(path: string, query: RequestOptions['query']): string {
  const params = Object.entries(query ?? {}).flatMap(([key, value]) => {
    if (value === undefined || value === '') return [];
    const values = Array.isArray(value) ? value : [String(value)];
    return values.map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
  });
  return `${BASE_URL}/api/v1${path}${params.length ? `?${params.join('&')}` : ''}`;
}

async function send(path: string, options: RequestOptions, token: string | null): Promise<Response> {
  if (!API_CONFIGURED) {
    throw new ApiError(0, 'NETWORK_ERROR', 'A URL da API não está configurada (EXPO_PUBLIC_API_BASE_URL).');
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.idempotencyKey && Platform.OS !== 'web') headers['Idempotency-Key'] = options.idempotencyKey;

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError(0, 'TIMEOUT', `A API não respondeu em ${Math.round(timeoutMs / 1000)} s. Tente novamente.`);
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Não foi possível conectar à API. Confira se ela está rodando e se o aparelho está na mesma rede.');
  } finally {
    clearTimeout(timer);
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw await toApiError(response);
  const text = response.status === 204 ? '' : await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(response.status, 'UNKNOWN', 'A API enviou uma resposta em formato inesperado.');
  }
}

function fallbackMessage(status: number): string {
  if (status === 400 || status === 422) return 'Dados inválidos. Revise os campos.';
  if (status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (status === 403) return 'Seu perfil não tem acesso a este recurso.';
  if (status === 404) return 'Não encontrado.';
  if (status === 429) return 'Muitas requisições seguidas. Aguarde alguns segundos.';
  if (status >= 500) return 'A API está indisponível no momento. Tente novamente em instantes.';
  return `A API respondeu com erro ${status}.`;
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: Partial<ErrorResponse> = {};
  try {
    const parsed: unknown = JSON.parse(await response.text());
    if (parsed && typeof parsed === 'object') body = parsed as Partial<ErrorResponse>;
  } catch {
    // Corpo vazio ou fora do formato ErrorResponse: fica a mensagem padrão.
  }
  const retryAfter = Number(response.headers.get('Retry-After'));
  return new ApiError(response.status, body.codigo_erro ?? 'UNKNOWN', body.mensagem ?? fallbackMessage(response.status), {
    camposInvalidos: body.campos_invalidos ?? undefined,
    sugestoes: body.sugestoes_similares ?? undefined,
    retryAfter: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
  });
}
