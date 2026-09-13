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

const DATA_LOCAL = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/;

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
