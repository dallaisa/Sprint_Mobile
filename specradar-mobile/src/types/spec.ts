import type { CampoSpec, SpecResponse as ApiSpecResponse } from '@/src/types/api';

/**
 * Ficha como o app usa: a resposta da API mais um id local e os campos
 * indexados por nome. Montada por toFicha (src/api/adapters.ts).
 */
export interface Ficha extends ApiSpecResponse {
  id: string;
  atributos: Record<string, CampoSpec>;
}

// Formato legado dos mocks. Sai conforme as telas migram para Ficha (fases 4 a 8).

export type Confidence = 'alta' | 'inferida' | 'nao_encontrado';

export interface SpecField {
  valor: string | number | null;
  confianca: Confidence;
  fonte: string | null;
  verificado_em: string | null;
}

export interface SpecQuery {
  marca: string;
  modelo: string;
  versao?: string;
  atributos: string[];
}

export interface SpecResponse {
  id: string;
  marca: string;
  modelo: string;
  versao: string;
  consultado_em: string;
  atributos: Record<string, SpecField>;
}

export interface ApiError {
  status: number;
  message: string;
}
