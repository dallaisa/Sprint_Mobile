import type { CampoSpec, SpecResponse as ApiSpecResponse } from '@/src/types/api';

/**
 * Ficha como o app usa: a resposta da API mais um id local e os campos
 * indexados por nome. Montada por toFicha (src/api/adapters.ts).
 */
export interface Ficha extends ApiSpecResponse {
  id: string;
  atributos: Record<string, CampoSpec>;
}
