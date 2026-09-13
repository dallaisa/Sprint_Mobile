// Vocabulário de atributos da API: os 16 atributos padrão da migration V6
// (sr_config.atributos_padrao). Usar esses nomes aproveita o cache da primeira
// consulta e mantém o vencedor do /specs/compare.

export type GrupoAtributo = 'desempenho' | 'economia' | 'espaco' | 'conducao';

export interface Atributo {
  /** Nome enviado e recebido pela API. */
  chave: string;
  rotulo: string;
  /** Unidade que costuma aparecer no texto do valor. */
  unidade?: string;
  grupo: GrupoAtributo;
  /** Direção do vencedor no /specs/compare; ausente quando a API não compara. */
  vencedor?: 'maior' | 'menor';
}

export const GRUPOS_ATRIBUTO: Record<GrupoAtributo, string> = {
  desempenho: 'Desempenho',
  economia: 'Economia',
  espaco: 'Espaço e chassi',
  conducao: 'Condução',
};

export const ATRIBUTOS = [
  { chave: 'motor', rotulo: 'Motor', grupo: 'desempenho' },
  { chave: 'potencia', rotulo: 'Potência', unidade: 'cv', grupo: 'desempenho', vencedor: 'maior' },
  { chave: 'torque', rotulo: 'Torque', unidade: 'Nm', grupo: 'desempenho', vencedor: 'maior' },
  { chave: 'aceleracao', rotulo: 'Aceleração 0–100 km/h', unidade: 's', grupo: 'desempenho', vencedor: 'menor' },
  { chave: 'transmissao', rotulo: 'Transmissão', grupo: 'desempenho' },
  { chave: 'tracao', rotulo: 'Tração', grupo: 'desempenho' },
  { chave: 'preco', rotulo: 'Preço', unidade: 'R$', grupo: 'economia', vencedor: 'menor' },
  { chave: 'consumo', rotulo: 'Consumo', unidade: 'km/l', grupo: 'economia', vencedor: 'maior' },
  { chave: 'dimensoes', rotulo: 'Dimensões', grupo: 'espaco' },
  { chave: 'rodas_pneus', rotulo: 'Rodas e pneus', grupo: 'espaco' },
  { chave: 'amortecedores', rotulo: 'Amortecedores', grupo: 'espaco' },
  { chave: 'modos_conducao', rotulo: 'Modos de condução', grupo: 'conducao' },
  { chave: 'modos_volante', rotulo: 'Modos do volante', grupo: 'conducao' },
  { chave: 'modos_escapamento', rotulo: 'Modos do escapamento', grupo: 'conducao' },
  { chave: 'modos_amortecedor', rotulo: 'Modos do amortecedor', grupo: 'conducao' },
  { chave: 'farois', rotulo: 'Faróis', grupo: 'conducao' },
] as const satisfies readonly Atributo[];

export type ChaveAtributo = (typeof ATRIBUTOS)[number]['chave'];

export const ATRIBUTOS_PADRAO: ChaveAtributo[] = ATRIBUTOS.map(atributo => atributo.chave);

/** SpecQueryRequest e ConfigRequest aceitam no máximo 20 atributos. */
export const MAX_ATRIBUTOS = 20;

export function atributosDoGrupo(grupo: GrupoAtributo): Atributo[] {
  return ATRIBUTOS.filter(atributo => atributo.grupo === grupo);
}

export function buscarAtributo(chave: string): Atributo | undefined {
  const normalizada = chave.trim().toLowerCase();
  return ATRIBUTOS.find(atributo => atributo.chave === normalizada);
}

/** Rótulo em português; atributos fora do vocabulário viram "Nome legível". */
export function rotuloAtributo(chave: string): string {
  const conhecido = buscarAtributo(chave);
  if (conhecido) return conhecido.rotulo;
  const texto = chave.trim().replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
