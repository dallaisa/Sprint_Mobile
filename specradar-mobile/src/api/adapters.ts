import type { CampoSpec, SpecResponse, VeiculoRef } from '@/src/types/api';
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

export type ParteMensagem = { texto: string; estilo: 'normal' | 'negrito' | 'italico' };

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
