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
