import { SpecQuery, SpecResponse, ApiError } from '@/src/types/spec';
import { TokenResponse, RegisterRequest } from '@/src/types/auth';
import { rangerRaptorMock } from './mocks/ranger-raptor';
import { mockLogin, mockRegister } from './mocks/auth';
import { getToken } from '@/src/storage/auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const USE_MOCK = !BASE_URL;
const TIMEOUT_MS = 15000;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
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

export async function loginUser(email: string, senha: string): Promise<TokenResponse> {
  if (USE_MOCK) return mockLogin(email, senha);

  const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const errMap: Record<number, string> = {
      401: 'E-mail ou senha incorretos.',
      429: 'Muitas tentativas. Tente novamente em instantes.',
    };
    throw new HttpError(response.status, errMap[response.status] ?? `Erro ${response.status}.`);
  }

  return response.json() as Promise<TokenResponse>;
}

export async function registerUser(data: RegisterRequest): Promise<void> {
  if (USE_MOCK) {
    await mockRegister(data.nome, data.email, data.senha);
    return;
  }

  const headers = await authHeaders();
  const response = await fetchWithTimeout(`${BASE_URL}/api/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errMap: Record<number, string> = {
      400: 'Dados inválidos. Verifique os campos.',
      401: 'Não autorizado.',
      409: 'E-mail já cadastrado.',
    };
    throw new HttpError(response.status, errMap[response.status] ?? `Erro ${response.status}.`);
  }
}

export async function querySpec(query: SpecQuery): Promise<SpecResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      ...rangerRaptorMock,
      id: `${query.marca}-${query.modelo}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),
      marca: query.marca,
      modelo: query.modelo,
      versao: query.versao ?? rangerRaptorMock.versao,
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
    const errMap: Record<number, string> = {
      401: 'Não autorizado. Faça login novamente.',
      404: 'Veículo não encontrado na base de dados.',
      422: 'Dados inválidos. Verifique marca e modelo.',
      503: 'Serviço indisponível. Tente novamente em instantes.',
    };
    throw new HttpError(response.status, errMap[response.status] ?? `Erro ${response.status}.`);
  }

  return response.json() as Promise<SpecResponse>;
}

export type { ApiError };
