import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SpecResponse } from '@/src/types/api';
import type { Ficha } from '@/src/types/spec';
import { parseApiDate, toFicha } from '@/src/api/adapters';

const KEY = '@specradar:history';
const RETENTION_MS = 3 * 24 * 60 * 60 * 1000;

const dateOf = (ficha: Ficha) => parseApiDate(ficha.consultado_em)?.getTime() ?? 0;

/**
 * Guarda a ficha no histórico do aparelho. Uma entrada por veículo: consultas
 * novas do mesmo carro atualizam os campos e mantêm os que não foram pedidos.
 */
export async function saveToHistory(ficha: Ficha): Promise<void> {
  const current = await loadHistory();
  const previous = current.find((item) => item.id === ficha.id);
  const campos = previous
    ? [...ficha.campos, ...previous.campos.filter((antigo) => !(antigo.campo.toLowerCase() in ficha.atributos))]
    : ficha.campos;
  const updated = [toFicha({ ...ficha, campos }), ...current.filter((item) => item.id !== ficha.id)];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function loadHistory(): Promise<Ficha[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const items: unknown = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    const cutoff = Date.now() - RETENTION_MS;
    // Entradas no formato antigo (sem "campos") eram dados de demonstração e são descartadas.
    return items
      .filter((item): item is SpecResponse => (
        item !== null && typeof item === 'object' &&
        typeof item.marca === 'string' && typeof item.modelo === 'string' && typeof item.versao === 'string' &&
        typeof item.consultado_em === 'string' && Array.isArray(item.campos)
      ))
      .map(toFicha)
      .filter((ficha) => dateOf(ficha) > cutoff)
      .sort((a, b) => dateOf(b) - dateOf(a));
  } catch {
    return [];
  }
}

export async function removeFromHistory(id: string): Promise<void> {
  const current = await loadHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify(current.filter((s) => s.id !== id)));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
