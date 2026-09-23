import type { CompareResponse, SpecQueryRequest, SpecResponse, VeiculoRef } from '@/src/types/api';
import type { Ficha } from '@/src/types/spec';
import { toFicha } from './adapters';
import { API_CONFIGURED, LLM_TIMEOUT_MS, request } from './http';
import { mockCompare, mockGetFicha, mockHistory, mockQuerySpec } from './mocks/servidor';

/**
 * POST /specs/query. Usa o banco quando a ficha já existe e chama o Gemini
 * quando não existe, por isso o timeout longo. Passe a mesma idempotencyKey ao
 * repetir a mesma consulta ("Tentar novamente").
 */
export async function querySpec(query: SpecQueryRequest, options: { idempotencyKey?: string } = {}): Promise<Ficha> {
  const spec = API_CONFIGURED
    ? await request<SpecResponse>('/specs/query', {
      method: 'POST',
      body: query,
      timeoutMs: LLM_TIMEOUT_MS,
      idempotencyKey: options.idempotencyKey,
    })
    : await mockQuerySpec(query);
  return toFicha(spec);
}

/** GET /specs/{marca}/{modelo}/{versao}: ficha já salva, sem chamar o Gemini. 404 traz sugestões. */
export async function getFicha(veiculo: VeiculoRef): Promise<Ficha> {
  const path = [veiculo.marca, veiculo.modelo, veiculo.versao].map(parte => encodeURIComponent(parte.trim())).join('/');
  const spec = API_CONFIGURED ? await request<SpecResponse>(`/specs/${path}`) : await mockGetFicha(veiculo);
  return toFicha(spec);
}

/** GET /specs/compare: os dois veículos precisam já estar salvos (senão, 404). */
export function compareSpecs(veiculo1: VeiculoRef, veiculo2: VeiculoRef, atributos?: string[]): Promise<CompareResponse> {
  if (!API_CONFIGURED) return mockCompare(veiculo1, veiculo2, atributos);
  return request<CompareResponse>('/specs/compare', {
    query: {
      v1Marca: veiculo1.marca.trim(), v1Modelo: veiculo1.modelo.trim(), v1Versao: veiculo1.versao.trim(),
      v2Marca: veiculo2.marca.trim(), v2Modelo: veiculo2.modelo.trim(), v2Versao: veiculo2.versao.trim(),
      atributos,
    },
  });
}

/** GET /specs/history: todas as fichas salvas na API (de todos os usuários), mais recentes primeiro. */
export async function listCatalog(filtro: { marca?: string; modelo?: string } = {}): Promise<Ficha[]> {
  const specs = API_CONFIGURED
    ? await request<SpecResponse[]>('/specs/history', { query: { marca: filtro.marca?.trim(), modelo: filtro.modelo?.trim() } })
    : await mockHistory(filtro);
  return specs.map(toFicha);
}
