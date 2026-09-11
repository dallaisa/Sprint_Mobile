/**
 * Tipos da camada de UI. Não são o contrato da API — esse vive em
 * src/types/api.ts, e a tradução entre os dois em src/api/adapters.ts.
 */

/**
 * Minúsculas por convenção da UI; o backend manda em maiúsculas e o
 * adapter normaliza. 'media' existe porque o backend produz MEDIA — sem
 * ela, o badge renderizava `undefined` sem erro e sem aviso do tsc.
 */
export type Confidence = 'alta' | 'media' | 'inferida' | 'nao_encontrado';

export interface SpecField {
  /**
   * O backend sempre devolve string (com unidade: "213 cv"). `number`
   * continua aceito porque há histórico salvo em AsyncStorage no formato
   * antigo, com valores numéricos crus.
   */
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
  /**
   * Sintetizado no cliente — o backend não devolve id. Ver
   * adapters.slugVeiculo(). É a chave do dedupe do histórico, da rota
   * /ficha/[id] e da seleção de comparação.
   */
  id: string;
  marca: string;
  modelo: string;
  versao: string;
  consultado_em: string;
  atributos: Record<string, SpecField>;

  /**
   * OPCIONAIS de propósito: já existe histórico salvo em AsyncStorage sem
   * estes campos. loadHistory() faz JSON.parse e devolve o objeto sem
   * validar, então o tsc não protegeria nada aqui — quem consome precisa
   * tratar undefined de verdade.
   */
  confidence_geral?: string;
  cache_hit?: boolean;
}

export interface ApiError {
  status: number;
  message: string;
}
