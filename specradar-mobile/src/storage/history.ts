import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpecResponse } from '@/src/types/spec';

const KEY = '@specradar:history';
const MAX_ITEMS = 10;

export async function saveToHistory(spec: SpecResponse): Promise<void> {
  const current = await loadHistory();
  const filtered = current.filter((s) => s.id !== spec.id);
  const updated = [spec, ...filtered].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function loadHistory(): Promise<SpecResponse[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SpecResponse[];
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
