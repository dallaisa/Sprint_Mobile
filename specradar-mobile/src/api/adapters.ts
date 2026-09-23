import type { CampoSpec, ItemComparativo, SpecResponse, VeiculoRef } from '@/src/types/api';
import type { Ficha } from '@/src/types/spec';

/**
 * Identificador local de uma ficha, com o mesmo critério da API para "mesmo
 * veículo": marca, modelo e versão sem espaços nas pontas e sem diferenciar
 * maiúsculas.
 */
export function fichaId(veiculo: VeiculoRef): string {
  return [veiculo.marca, veiculo.modelo, veiculo.versao]
    .map(parte => parte.trim().toLowerCase())
    .join('|');
}

/** Inverso de fichaId. A API busca sem diferenciar maiúsculas, então o trio em minúsculas serve. */
export function veiculoDoId(id: string): VeiculoRef | null {
  const [marca, modelo, versao, ...resto] = id.split('|');
  return marca && modelo && versao && resto.length === 0 ? { marca, modelo, versao } : null;
}

/**
 * As sugestões do 404 de ficha vêm como "Marca Modelo Versão", sempre com a
 * marca e o modelo pedidos. Devolve só a versão, ou null se o texto não
 * começar por eles.
 */
export function versaoDaSugestao(sugestao: string, marca: string, modelo: string): string | null {
  const prefixo = `${marca.trim()} ${modelo.trim()} `.toLowerCase();
  if (!sugestao.toLowerCase().startsWith(prefixo)) return null;
  return sugestao.slice(prefixo.length).trim() || null;
}

/** Ficha da API com id local e campos indexados pelo nome (em minúsculas). */
export function toFicha(spec: SpecResponse): Ficha {
  const atributos: Record<string, CampoSpec> = {};
  for (const campo of spec.campos) {
    const chave = campo.campo.trim().toLowerCase();
    // Mesmo critério da API ao filtrar campos: vale o primeiro com esse nome.
    if (!(chave in atributos)) atributos[chave] = campo;
  }
  return { ...spec, id: fichaId(spec), atributos };
}

// Unidades que a API reconhece ao escolher o vencedor (SpecService.CampoNumerico),
// com o fator para a unidade base (torque em Nm).
const UNIDADES_COMPARAVEIS: Record<string, { padrao: RegExp; fator: number }[]> = {
  potencia: [{ padrao: /(\d+(?:[.,]\d+)?)\s*cv/i, fator: 1 }],
  torque: [
    { padrao: /(\d+(?:[.,]\d+)?)\s*nm/i, fator: 1 },
    { padrao: /(\d+(?:[.,]\d+)?)\s*kgf\s*\.?\s*m/i, fator: 9.80665 },
  ],
  aceleracao: [{ padrao: /(\d+(?:[.,]\d+)?)\s*segundos/i, fator: 1 }],
  preco: [{ padrao: /r\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/i, fator: 1 }],
  consumo: [{ padrao: /(\d+(?:[.,]\d+)?)\s*km\/l/i, fator: 1 }],
};

/**
 * Número de um valor em texto ("397 cv @ 5.650 rpm" → 397; "55 kgfm" → 539,4 Nm),
 * com as mesmas unidades que a API usa no compare. null quando o atributo não é
 * comparável ou o texto não traz a unidade esperada. Diferente da API, "5.8" é
 * lido como decimal (a API leria 58).
 */
export function valorComparavel(atributo: string, valor: string | null): number | null {
  if (!valor) return null;
  for (const { padrao, fator } of UNIDADES_COMPARAVEIS[atributo.trim().toLowerCase()] ?? []) {
    const encontrado = padrao.exec(valor)?.[1];
    if (!encontrado) continue;
    const normalizado = /^\d+\.\d{1,2}$/.test(encontrado) ? encontrado : encontrado.replace(/\./g, '').replace(',', '.');
    const numero = Number(normalizado) * fator;
    return Number.isFinite(numero) ? numero : null;
  }
  return null;
}

/**
 * Lado vencedor de um item do /specs/compare: 0, 1, 'empate' ou null. A API
 * devolve só o nome do modelo, então dois carros com o mesmo modelo (Ranger XLT
 * × Ranger Raptor) ficam sem vencedor identificável.
 */
export function ladoVencedor(item: ItemComparativo, veiculo1: VeiculoRef, veiculo2: VeiculoRef): 0 | 1 | 'empate' | null {
  if (item.vencedor === 'EMPATE') return 'empate';
  const nome = item.vencedor.trim().toLowerCase();
  const modelo1 = veiculo1.modelo.trim().toLowerCase();
  const modelo2 = veiculo2.modelo.trim().toLowerCase();
  if (item.vencedor === 'N/A' || modelo1 === modelo2) return null;
  if (nome === modelo1) return 0;
  if (nome === modelo2) return 1;
  return null;
}

export type ParteMensagem ={ texto: string; estilo: 'normal' | 'negrito' | 'italico' };

/**
 * A mensagem do /chat/message usa **negrito** e *itálico* no estilo Markdown
 * ("Encontrei as especificações da **Ford Ranger Raptor**:"). Quebra o texto
 * em partes para exibir sem os asteriscos.
 */
export function partesDaMensagem(mensagem: string): ParteMensagem[] {
  const texto = mensagem.replace(/\n{3,}/g, '\n\n').trim();
  return texto.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
    .filter(Boolean)
    .map((parte): ParteMensagem => {
      if (/^\*\*[^*]+\*\*$/.test(parte)) return { texto: parte.slice(2, -2), estilo: 'negrito' };
      if (/^\*[^*\n]+\*$/.test(parte)) return { texto: parte.slice(1, -1), estilo: 'italico' };
      return { texto: parte, estilo: 'normal' };
    });
}

const DATA_LOCAL =/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/;

/**
 * Lê datas da API. LocalDateTime não tem fuso e pode vir com até 9 casas
 * decimais ("2026-09-13T12:29:18.9561027"), o que Date.parse não aceita em
 * todos os motores. Trata como horário local e corta a fração em milissegundos.
 * Datas com fuso explícito (ex.: gravadas antes pelo próprio app) seguem para
 * Date.parse.
 */
export function parseApiDate(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const texto = valor.trim();
  const partes = DATA_LOCAL.exec(texto);
  if (!partes) {
    const tempo = Date.parse(texto);
    return Number.isNaN(tempo) ? null : new Date(tempo);
  }
  const [, ano, mes, dia, hora = '0', minuto = '0', segundo = '0', fracao = ''] = partes;
  const data = new Date(
    Number(ano), Number(mes) - 1, Number(dia),
    Number(hora), Number(minuto), Number(segundo),
    Number(fracao.slice(0, 3).padEnd(3, '0')),
  );
  return Number.isNaN(data.getTime()) ? null : data;
}
