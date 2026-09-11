/**
 * Vocabulário de atributos técnicos do SpecRadar.
 *
 * Este arquivo é a fronteira entre o app e o contrato da API. Boa parte
 * do que está aqui NÃO é escolha nossa — são espelhos do backend, e cada
 * um cita a fonte que precisa ser conferida antes de qualquer alteração.
 *
 * Por que isso importa: o backend casa nome de atributo por igualdade
 * exata. Um nome fora do vocabulário não gera erro nenhum — a consulta
 * responde 200, a ficha aparece na tela, e só o "vencedor" da comparação
 * some silenciosamente. Era exatamente esse o bug que motivou este módulo
 * (o app usava `potencia_cv`, o backend espera `potencia`).
 */

// ---------------------------------------------------------------------
// CONTRATO — espelhos do backend
// ---------------------------------------------------------------------

/**
 * ESPELHO DE: `sr_config.atributos_padrao`
 *   - Sprint-Ford-icers-API/src/main/resources/db/migration/V6__create_config.sql
 *     (o INSERT no fim do arquivo)
 *   - ...service/ConfigService.java → FALLBACK_PADRAO
 *
 * Ordem preservada conforme o backend. Um ADMIN pode editar essa lista em
 * runtime via `PUT /api/v1/specs/config` — se isso acontecer, este arquivo
 * precisa ser ressincronizado à mão. Não há validação automática.
 */
export const ATRIBUTOS_API: readonly string[] = [
  'motor',
  'potencia',
  'torque',
  'transmissao',
  'tracao',
  'amortecedores',
  'aceleracao',
  'modos_conducao',
  'farois',
  'rodas_pneus',
  'preco',
  'consumo',
  'dimensoes',
  'modos_volante',
  'modos_escapamento',
  'modos_amortecedor',
];

/**
 * ESPELHO DE: enum `CampoNumerico` em ...service/SpecService.java
 *
 * Só estes 5 atributos têm vencedor. Os outros 11 são descritivos ou
 * multivalorados, e o backend devolve "N/A" de propósito — comparar
 * `transmissao` numericamente produziria resultado arbitrário (mais
 * marchas nem sempre é melhor).
 */
export const MAIOR_MELHOR = new Set(['potencia', 'torque', 'consumo']);
export const MENOR_MELHOR = new Set(['aceleracao', 'preco']);

// ---------------------------------------------------------------------
// EXTRAÇÃO NUMÉRICA — espelho das regex de CampoNumerico
// ---------------------------------------------------------------------

/** "9,5" | "213" | "10.5" → 9.5 | 213 | 10.5 */
function numeroSimples(bruto: string): number | null {
  const n = parseFloat(bruto.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Formato brasileiro: ponto é separador de milhar, vírgula é decimal.
 * "459.990,00" → 459990. Sem esse tratamento, o parse ingênuo lê
 * "459.990" como 459,99 — o preço erra por três ordens de grandeza.
 */
function numeroBrasileiro(bruto: string): number | null {
  const n = parseFloat(bruto.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

interface Unidade {
  regex: RegExp;
  /** Multiplicador para a unidade base (ex.: kgf·m → Nm). */
  fator: number;
  parse: (bruto: string) => number | null;
}

/**
 * Unidades reconhecidas por atributo, na mesma ordem de precedência do
 * backend — em "500 Nm (51 kgfm)" o Nm ganha, como lá.
 */
const UNIDADES: Record<string, readonly Unidade[]> = {
  potencia: [{ regex: /(\d+(?:[.,]\d+)?)\s*cv/i, fator: 1, parse: numeroSimples }],
  torque: [
    { regex: /(\d+(?:[.,]\d+)?)\s*nm/i, fator: 1, parse: numeroSimples },
    // 1 kgf·m ≈ 9,80665 Nm
    { regex: /(\d+(?:[.,]\d+)?)\s*kgf\s*\.?\s*m/i, fator: 9.80665, parse: numeroSimples },
  ],
  aceleracao: [{ regex: /(\d+(?:[.,]\d+)?)\s*segundos/i, fator: 1, parse: numeroSimples }],
  preco: [{ regex: /r\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/i, fator: 1, parse: numeroBrasileiro }],
  consumo: [{ regex: /(\d+(?:[.,]\d+)?)\s*km\/l/i, fator: 1, parse: numeroSimples }],
};

/**
 * Extrai o número comparável de um valor, respeitando a unidade esperada
 * para aquele atributo. Devolve null quando o atributo não é comparável
 * ou quando o valor não traz a unidade reconhecida — mesmo critério do
 * backend, que nesses casos responde "N/A".
 */
export function extrairValorComparavel(
  chave: string,
  valor: string | number | null
): number | null {
  if (valor === null) return null;

  const unidades = UNIDADES[chave];
  if (!unidades) return null;

  const texto = String(valor);
  for (const unidade of unidades) {
    const achou = texto.match(unidade.regex);
    if (achou?.[1]) {
      const n = unidade.parse(achou[1]);
      if (n !== null) return n * unidade.fator;
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// APRESENTAÇÃO — decisões nossas, livres para ajustar
// ---------------------------------------------------------------------

/**
 * Atributos oferecidos como chips no formulário, reordenados para colocar
 * primeiro os 5 que produzem vencedor na comparação.
 *
 * Por que os 16 inteiros, e não um recorte menor:
 *  - `modos_volante`, `modos_escapamento` e `modos_amortecedor` entraram
 *    no backend por exigência explícita do brief da Ford (ver comentário
 *    da V6) — cortá-los é cortar requisito;
 *  - restringir a lista não economiza chamada de LLM: na primeira consulta
 *    de um veículo o backend busca o conjunto padrão completo de qualquer
 *    forma, independentemente do que foi pedido;
 *  - desmarcar um chip é mais fácil para o analista do que descobrir que
 *    um atributo sequer era oferecido.
 *
 * Se a tela ficar pesada demais na validação com usuário, este é o lugar
 * para cortar — e só aqui, sem tocar em ATRIBUTOS_API.
 */
export const ATRIBUTOS_FORMULARIO: readonly string[] = [
  // comparáveis primeiro — são os que produzem vencedor
  'potencia',
  'torque',
  'aceleracao',
  'consumo',
  'preco',
  // identidade mecânica
  'motor',
  'transmissao',
  'tracao',
  'dimensoes',
  // equipamento
  'amortecedores',
  'rodas_pneus',
  'farois',
  // modos — os três últimos vieram do brief oficial da Ford
  'modos_conducao',
  'modos_volante',
  'modos_escapamento',
  'modos_amortecedor',
];

/** Rótulos em PT-BR. `replace(/_/g, ' ')` produziria "modos amortecedor". */
export const LABELS: Record<string, string> = {
  motor: 'Motor',
  potencia: 'Potência',
  torque: 'Torque',
  transmissao: 'Transmissão',
  tracao: 'Tração',
  amortecedores: 'Amortecedores',
  aceleracao: 'Aceleração (0–100 km/h)',
  modos_conducao: 'Modos de condução',
  farois: 'Faróis',
  rodas_pneus: 'Rodas e pneus',
  preco: 'Preço',
  consumo: 'Consumo',
  dimensoes: 'Dimensões (C × L × A)',
  modos_volante: 'Modos do volante',
  modos_escapamento: 'Modos do escapamento',
  modos_amortecedor: 'Modos do amortecedor',
};

/**
 * Rótulo de um atributo, com degradação graciosa: uma ficha em cache pode
 * trazer chave antiga, e o ADMIN pode cadastrar atributo novo no
 * `sr_config` sem que este arquivo saiba. Melhor mostrar "modos extras"
 * do que quebrar a tela.
 */
export function rotuloAtributo(chave: string): string {
  const conhecido = LABELS[chave];
  if (conhecido) return conhecido;
  const solto = chave.replace(/_/g, ' ');
  return solto.charAt(0).toUpperCase() + solto.slice(1);
}
