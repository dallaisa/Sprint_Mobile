import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@specradar:auth';

interface StoredAuth {
  token: string;
  expiraEm: string;
}

export async function saveToken(token: string, expiraEm: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token, expiraEm }));
}

export async function getToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  const { token, expiraEm } = JSON.parse(raw) as StoredAuth;
  if (new Date(expiraEm) <= new Date()) {
    await AsyncStorage.removeItem(AUTH_KEY);
    return null;
  }
  return token;
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}
