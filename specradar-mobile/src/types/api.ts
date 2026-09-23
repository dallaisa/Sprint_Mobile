// Contrato exato da Sprint-Ford-icers-API (/api/v1), campo a campo como vem no JSON.
// A maioria usa snake_case; RefreshRequest, UsuarioResponse e ConfigResponse usam camelCase.
// Datas são LocalDateTime sem fuso — leia com parseApiDate (src/api/adapters.ts).

export type Role = 'ANALYST' | 'ADMIN';

// Autenticação

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  /** Validade do access token em segundos (28800 = 8 h). */
  expires_in: number;
  role: Role;
}

// Especificações

export type ConfiancaCampo = 'ALTA' | 'MEDIA' | 'INFERIDA' | 'NAO_ENCONTRADO';
export type ConfiancaGeral = 'ALTA' | 'MEDIA' | 'PARCIAL' | 'BAIXA';

export interface CampoSpec {
  campo: string;
  /** Sempre texto ("397 cv @ 5.650 rpm"); null quando não encontrado. */
  valor: string | null;
  confianca: ConfiancaCampo;
  fonte: string | null;
  /** Data ISO (yyyy-mm-dd). */
  verificado_em: string | null;
}

export interface SpecQueryRequest {
  /** 2–50 caracteres: letras, espaços e hífens. */
  marca: string;
  /** 2–80 caracteres: letras, espaços e hífens (sem números). */
  modelo: string;
  /** 2–80 caracteres: letras, números, espaços, hífens e pontos. */
  versao: string;
  /** 1–20 atributos. */
  atributos: string[];
}

export interface SpecResponse {
  marca: string;
  modelo: string;
  versao: string;
  /** Só os atributos pedidos, sempre presentes (inclusive os não encontrados). */
  campos: CampoSpec[];
  confidence_geral: ConfiancaGeral;
  consultado_em: string;
  /** true quando veio do banco sem chamar o Gemini. */
  cache_hit: boolean;
}

export interface ChatMessageRequest {
  /** 3–500 caracteres. */
  mensagem: string;
}

export interface ChatResponse {
  /** Texto com **negrito** e *itálico* no estilo Markdown. */
  mensagem: string;
  ficha: SpecResponse | null;
  /** false quando o veículo não foi identificado ou algo falhou por dentro (a resposta ainda é 200). */
  sucesso: boolean;
}

export interface VeiculoRef {
  marca: string;
  modelo: string;
  versao: string;
}

export interface ItemComparativo {
  atributo: string;
  veiculo1: CampoSpec;
  veiculo2: CampoSpec;
  /** Nome do modelo vencedor, 'EMPATE' ou 'N/A'. Só potencia, torque, aceleracao, preco e consumo têm vencedor. */
  vencedor: string;
}

export interface CompareResponse {
  veiculo1: VeiculoRef;
  veiculo2: VeiculoRef;
  comparativo: ItemComparativo[];
}

// Administração (somente ADMIN)

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  role: Role;
  /** 'S' ativo, 'N' desativado ou anonimizado. */
  ativo: 'S' | 'N';
  criadoEm: string;
  ultimoAcesso: string | null;
}

export interface UsuarioCreateRequest {
  nome: string;
  email: string;
  /** Mínimo de 8 caracteres. */
  senha: string;
  role: Role;
}

export interface UsuarioUpdateRequest {
  nome: string;
  email: string;
  role: Role;
}

export interface ConfigResponse {
  atributosPadrao: string[];
  intervaloReverificacaoDias: number;
  atualizadoEm: string;
}

export interface ConfigRequest {
  /** 1–20 atributos. */
  atributosPadrao: string[];
  /** 2–31 dias. */
  intervaloReverificacaoDias: number;
}

// Erros

export type CodigoErro =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_REFRESH_TOKEN'
  | 'ACCOUNT_LOCKED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'SELF_DEACTIVATION_BLOCKED'
  | 'SELF_ANONYMIZATION_BLOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'NOT_IMPLEMENTED';

export interface ErrorResponse {
  codigo_erro: CodigoErro;
  mensagem: string;
  /** Ausente nos 401/403 gerados pelo filtro de segurança e nos 429 do limite por IP. */
  timestamp?: string;
  endpoint?: string;
  /** Presente nos 422: campo → mensagem. */
  campos_invalidos?: Record<string, string> | null;
  /** Presente no 404 de ficha: "Marca Modelo Versão" das fichas parecidas já salvas. */
  sugestoes_similares?: string[] | null;
}
