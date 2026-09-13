import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpecResponse } from '@/src/types/spec';

const KEY = '@specradar:history';
const RETENTION_MS = 3 * 24 * 60 * 60 * 1000;

export async function saveToHistory(spec: SpecResponse): Promise<void> {
  const current = await loadHistory();
  const filtered = current.filter((s) => s.id !== spec.id);
  const updated = [spec, ...filtered];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function loadHistory(): Promise<SpecResponse[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const items: unknown = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    const cutoff = Date.now() - RETENTION_MS;
    return items.filter((item): item is SpecResponse => (
      item !== null && typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.consultado_em === 'string' &&
      Date.parse(item.consultado_em) > cutoff
    )).sort((a, b) => Date.parse(b.consultado_em) - Date.parse(a.consultado_em));
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
