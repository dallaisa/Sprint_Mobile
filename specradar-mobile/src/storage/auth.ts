import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@specradar:auth';

interface StoredAuth {
  token: string;
  expiraEm: string;
}

let sessionAuth: StoredAuth | null = null;

export async function saveToken(token: string, expiraEm: string, remember = true): Promise<void> {
  if (remember) {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token, expiraEm }));
    sessionAuth = null;
  } else {
    await AsyncStorage.removeItem(AUTH_KEY);
    sessionAuth = { token, expiraEm };
  }
}

export async function getToken(): Promise<string | null> {
  if (sessionAuth) {
    if (new Date(sessionAuth.expiraEm).getTime() > Date.now()) return sessionAuth.token;
    sessionAuth = null;
  }
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
  sessionAuth = null;
  await AsyncStorage.removeItem(AUTH_KEY);
}
