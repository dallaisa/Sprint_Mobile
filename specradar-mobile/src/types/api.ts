/**
 * Espelhos do contrato da API — o que o backend REALMENTE devolve.
 *
 * Nada aqui é escolha nossa, e nada aqui tem lógica: são só tipos, em
 * snake_case, exatamente como chegam no JSON. A tradução para os tipos
 * que a UI consome vive em src/api/adapters.ts — este arquivo é o lado
 * "cru" dessa fronteira.
 *
 * Regra ao mexer: confira o .java citado antes, nunca o README (a tabela
 * de endpoints dele já está desatualizada — lista o chat sob /specs,
 * quando o ChatController mapeia /api/v1/chat).
 */

// ---------------------------------------------------------------------
// Specs
// ---------------------------------------------------------------------

/**
 * Valores esperados em CampoSpec.confianca.
 *
 * Documentados em @Schema(allowableValues) no CampoSpec.java, mas o campo
 * é declarado como String, não enum — o valor nasce do parse da resposta
 * do Gemini. Por isso o tipo do campo abaixo é `string`, não esta união:
 * tipar estrito seria afirmar uma garantia que o backend não dá, e o
 * TypeScript não valida JSON em runtime de qualquer forma. A união fica
 * como documentação e como base do normalizador no adapter.
 */
export type ConfiancaApi = 'ALTA' | 'MEDIA' | 'INFERIDA' | 'NAO_ENCONTRADO';

/** Mesmo raciocínio de ConfiancaApi — domínio diferente, note PARCIAL/BAIXA. */
export type ConfidenceGeralApi = 'ALTA' | 'MEDIA' | 'PARCIAL' | 'BAIXA';

/** ESPELHO DE: dto/response/CampoSpec.java */
export interface CampoSpecApi {
  campo: string;
  /** String SEMPRE — o backend nunca devolve número. Null quando não achou. */
  valor: string | null;
  /** Ver ConfiancaApi. Chega em MAIÚSCULAS. */
  confianca: string;
  fonte: string | null;
  verificado_em: string | null;
}

/**
 * ESPELHO DE: dto/response/SpecResponse.java
 *
 * Atenção: NÃO existe `id`. O app depende de id para a rota /ficha/[id],
 * para o dedupe do histórico e para a seleção de comparação — ele é
 * sintetizado em adapters.slugVeiculo().
 */
export interface SpecApiResponse {
  marca: string;
  modelo: string;
  versao: string;
  campos: CampoSpecApi[];
  confidence_geral: string;
  /** ISO local, sem timezone: "2026-05-10T14:30:00". */
  consultado_em: string;
  /** true = veio do banco; false = veio do LLM. */
  cache_hit: boolean;
}

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------

/**
 * ESPELHO DE: dto/response/AuthResponse.java
 *
 * `expires_in` está em SEGUNDOS (AuthController.ACCESS_TOKEN_EXPIRES_IN
 * = 28800L), não em milissegundos — apesar de jwt.expiration.access nas
 * properties estar em ms. Confundir os dois gera um token "válido" por
 * 8 mil anos ou por 8 segundos, dependendo da direção do erro.
 */
export interface AuthApiResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  role: string;
}

// ---------------------------------------------------------------------
// Erros
// ---------------------------------------------------------------------

/**
 * ESPELHO DE: dto/response/ErrorResponse.java
 *
 * Só `codigo_erro` e `mensagem` são confiáveis. O resto é opcional de
 * verdade, e não só por conveniência de tipagem:
 *  - `campos_invalidos` só aparece em erro de validação (400);
 *  - `sugestoes_similares` só no 404 de veículo não encontrado, e ainda
 *    assim apenas quando existe alguma sugestão;
 *  - os 401/403 são escritos à mão em SecurityConfig e o 429 em
 *    RateLimitFilter, como string JSON literal — nenhum deles passa por
 *    este record, e trazem menos campos ainda.
 */
export interface ApiErrorResponse {
  codigo_erro: string;
  mensagem: string;
  timestamp?: string;
  endpoint?: string;
  campos_invalidos?: Record<string, string>;
  sugestoes_similares?: string[];
}
