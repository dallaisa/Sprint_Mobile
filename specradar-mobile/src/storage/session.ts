import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse, Role } from '@/src/types/api';

const SESSION_KEY = '@specradar:session';

export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Momento (ms) em que o access token vence. */
  accessExpiresAt: number;
  /** Momento (ms) em que o refresh token vence, lido do JWT; null se não for possível ler. */
  refreshExpiresAt: number | null;
  role: Role;
  email: string;
  /** false: "Lembrar de mim" desmarcado, a sessão fica só em memória. */
  remember: boolean;
}

export type SessionEndReason = 'logout' | 'expired';

// undefined: o AsyncStorage ainda não foi lido.
let current: Session | null | undefined;
const listeners = new Set<(reason: SessionEndReason) => void>();

function jwtExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload || typeof atob !== 'function') return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))) as { exp?: unknown };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function fromAuth(auth: AuthResponse, email: string, remember: boolean): Session {
  return {
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    accessExpiresAt: Date.now() + auth.expires_in * 1000,
    refreshExpiresAt: jwtExpiration(auth.refresh_token),
    role: auth.role,
    email,
    remember,
  };
}

function parseStored(raw: string): Session | null {
  try {
    const value = JSON.parse(raw) as Partial<Session>;
    const valid = typeof value.accessToken === 'string' && typeof value.refreshToken === 'string' &&
      typeof value.accessExpiresAt === 'number' && (value.role === 'ADMIN' || value.role === 'ANALYST') &&
      typeof value.email === 'string';
    return valid ? { ...value, refreshExpiresAt: value.refreshExpiresAt ?? null, remember: true } as Session : null;
  } catch {
    return null;
  }
}

async function store(session: Session): Promise<void> {
  current = session;
  if (session.remember) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else await AsyncStorage.removeItem(SESSION_KEY);
}

export async function startSession(auth: AuthResponse, email: string, remember: boolean): Promise<Session> {
  const session = fromAuth(auth, email.trim().toLowerCase(), remember);
  await store(session);
  return session;
}

/** Sessão atual, ou null se não houver ou se o refresh token já venceu. */
export async function getSession(): Promise<Session | null> {
  if (current === undefined) {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    current = raw ? parseStored(raw) : null;
  }
  if (current?.refreshExpiresAt && current.refreshExpiresAt <= Date.now()) {
    current = null;
    await AsyncStorage.removeItem(SESSION_KEY);
  }
  return current;
}

/** Guarda o par novo do /auth/refresh. Devolve null se a sessão foi encerrada durante a troca. */
export async function updateSessionTokens(auth: AuthResponse): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;
  const updated = fromAuth(auth, session.email, session.remember);
  await store(updated);
  return updated;
}

/** A API não tem logout: encerrar apaga só a sessão do aparelho. */
export async function endSession(reason: SessionEndReason = 'logout'): Promise<void> {
  const hadSession = current !== null;
  current = null;
  await AsyncStorage.removeItem(SESSION_KEY);
  if (hadSession) listeners.forEach(listener => listener(reason));
}

export function onSessionEnd(listener: (reason: SessionEndReason) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
