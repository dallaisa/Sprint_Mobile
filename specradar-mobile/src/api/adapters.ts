/**
 * Tradução entre o contrato do backend (src/types/api.ts) e os tipos que
 * a UI consome (src/types/spec.ts).
 *
 * Toda a diferença entre os dois lados é absorvida aqui — a UI não deve
 * saber que o backend devolve `campos[]` em vez de `atributos{}`, nem que
 * a confiança chega em maiúsculas, nem que não existe id.
 *
 * Estas funções recebem dado vindo da rede: JSON.parse devolve `any`, e o
 * tsc não valida nada em runtime. Por isso tudo aqui é defensivo de
 * propósito, mesmo quando o tipo declarado "garante" que o campo existe.
 */

import { SpecResponse, SpecField, Confidence } from '@/src/types/spec';
import { SpecApiResponse, CampoSpecApi, ApiErrorResponse } from '@/src/types/api';

// ---------------------------------------------------------------------
// Identidade do veículo
// ---------------------------------------------------------------------

/**
 * Remove diacriticos do texto.
 *
 * O guard nao e paranoia: normalize e ES2015 e o Hermes implementa, mas
 * isso NAO foi verificado em device real, e o custo de errar seria toda
 * consulta estourando. Sem normalize, degradamos em vez de quebrar --
 * o acento passa a valer como separador, o id continua estavel dentro do
 * device, e o app segue de pe.
 *
 * Sem acento nos comentarios deste bloco de proposito: o arquivo mistura
 * escapes unicode e texto, e ja houve corrupcao de encoding aqui.
 */
function semAcentos(bruto: string): string {
  return typeof bruto.normalize === 'function'
    ? bruto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : bruto;
}

function normalizarSegmento(bruto: string): string {
  return semAcentos(bruto ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Id sintético e estável de um veículo. O backend não devolve id, mas o
 * app precisa de um: é a chave do dedupe do histórico, da rota
 * /ficha/[id] e da seleção de comparação.
 *
 * Por que isto é fiel, e não uma gambiarra: o backend já trata
 * marca/modelo/versao como case-insensitive em toda consulta
 * (findFirstByMarcaIgnoreCase...), e a V7 impõe a mesma regra no banco
 * com um índice único sobre UPPER(marca), UPPER(modelo), UPPER(versao).
 * Ou seja, essa tripla normalizada JÁ É a identidade do veículo lá.
 *
 * Consequência aceita: "Ranger Raptor" e "ranger-raptor" colidem no mesmo
 * id — exatamente como colidem no índice do backend.
 *
 * CUIDADO ao alterar a regra: ids já gravados no AsyncStorage dos devices
 * viram órfãos, e o histórico existente deixa de abrir.
 */
export function slugVeiculo(marca: string, modelo: string, versao: string): string {
  return [marca, modelo, versao]
    .map(normalizarSegmento)
    .filter(Boolean)
    .join('-');
}

// ---------------------------------------------------------------------
// Confiança
// ---------------------------------------------------------------------

const CONFIANCAS: Record<string, Confidence> = {
  ALTA: 'alta',
  MEDIA: 'media',
  INFERIDA: 'inferida',
  NAO_ENCONTRADO: 'nao_encontrado',
};

/**
 * Normaliza a confiança de um campo.
 *
 * Duas decisões que valem explicação:
 *
 * 1. Sem valor, a confiança é 'nao_encontrado' independentemente do
 *    rótulo. O backend já faz isso via CampoSpec.naoEncontrado(), mas se
 *    um valor vier null com rótulo ALTA (resposta malformada do LLM), a
 *    UI mostraria "—" com selo verde. O valor manda sobre o rótulo.
 *
 * 2. Rótulo desconhecido cai em 'inferida', não em 'nao_encontrado'.
 *    Um rótulo que não reconhecemos não é motivo para esconder um dado
 *    real atrás de "—" — 'inferida' mostra o valor e sinaliza cautela.
 */
export function normalizarConfianca(
  bruta: string | null | undefined,
  valor: string | null | undefined
): Confidence {
  if (valor === null || valor === undefined || valor === '') return 'nao_encontrado';
  const chave = String(bruta ?? '').trim().toUpperCase();
  return CONFIANCAS[chave] ?? 'inferida';
}

// ---------------------------------------------------------------------
// Ficha técnica
// ---------------------------------------------------------------------

/**
 * `campos[]` → `atributos{}`, chaveado pelo nome do atributo.
 *
 * Chave repetida: a última vence. Não deveria acontecer, mas uma ficha
 * criada antes do alinhamento da Fase 1 pode ter tanto `potencia` quanto
 * `potencia_cv` gravados — o que não gera duplicata de chave, mas indica
 * que fichas antigas no banco podem estar poluídas.
 */
export function toSpecResponse(api: SpecApiResponse): SpecResponse {
  const atributos: Record<string, SpecField> = {};

  for (const campo of api?.campos ?? []) {
    if (!campo?.campo) continue;
    atributos[campo.campo] = toSpecField(campo);
  }

  return {
    id: slugVeiculo(api.marca, api.modelo, api.versao),
    marca: api.marca,
    modelo: api.modelo,
    versao: api.versao,
    consultado_em: api.consultado_em,
    atributos,
    confidence_geral: api.confidence_geral,
    cache_hit: api.cache_hit,
  };
}

function toSpecField(campo: CampoSpecApi): SpecField {
  return {
    valor: campo.valor ?? null,
    confianca: normalizarConfianca(campo.confianca, campo.valor),
    fonte: campo.fonte ?? null,
    verificado_em: campo.verificado_em ?? null,
  };
}

// ---------------------------------------------------------------------
// Erros
// ---------------------------------------------------------------------

/**
 * Erro já normalizado. `camposInvalidos` e `sugestoesSimilares` ficam
 * disponíveis aqui desde já, mas só passam a ser renderizados na Fase 4 —
 * hoje o app descarta os dois, que é informação boa jogada fora.
 */
export interface ApiErrorNormalizado {
  status: number;
  codigoErro: string;
  /** Vazia quando o corpo não trouxe mensagem utilizável. */
  mensagem: string;
  endpoint?: string;
  camposInvalidos?: Record<string, string>;
  sugestoesSimilares?: string[];
}

/**
 * Normaliza o corpo de um erro, tolerando os formatos reduzidos: os
 * 401/403 do SecurityConfig e o 429 do RateLimitFilter são strings JSON
 * escritas à mão, sem passar pelo ErrorResponse. E um proxy, um túnel ou
 * um 500 de container podem devolver HTML ou corpo vazio — nesses casos
 * `corpo` nem é objeto.
 */
export function toApiError(corpo: unknown, status: number): ApiErrorNormalizado {
  if (typeof corpo !== 'object' || corpo === null) {
    return { status, codigoErro: 'UNKNOWN', mensagem: '' };
  }

  const bruto = corpo as Partial<ApiErrorResponse>;

  return {
    status,
    codigoErro: typeof bruto.codigo_erro === 'string' ? bruto.codigo_erro : 'UNKNOWN',
    mensagem: typeof bruto.mensagem === 'string' ? bruto.mensagem : '',
    endpoint: typeof bruto.endpoint === 'string' ? bruto.endpoint : undefined,
    camposInvalidos:
      bruto.campos_invalidos && typeof bruto.campos_invalidos === 'object'
        ? (bruto.campos_invalidos as Record<string, string>)
        : undefined,
    sugestoesSimilares: Array.isArray(bruto.sugestoes_similares)
      ? bruto.sugestoes_similares
      : undefined,
  };
}
