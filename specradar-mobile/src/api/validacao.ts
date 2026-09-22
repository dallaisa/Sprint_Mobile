// Regras do SpecQueryRequest da API, para validar antes de enviar.

/** 2–50 caracteres: letras, espaços e hífens. */
export const MARCA_REGEX = /^[a-zA-ZÀ-ÿ\s-]{2,50}$/;
/** 2–80 caracteres: letras, espaços e hífens (a API recusa números, ex.: "S10"). */
export const MODELO_REGEX = /^[a-zA-ZÀ-ÿ\s-]{2,80}$/;
/** 2–80 caracteres: letras, números, espaços, hífens e pontos. */
export const VERSAO_REGEX = /^[a-zA-ZÀ-ÿ0-9\s.-]{2,80}$/;
/** Versão usada quando o usuário não informa uma; é a mesma que o chat da API usa. */
export const VERSAO_PADRAO = 'base';
