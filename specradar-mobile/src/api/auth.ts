import type { AuthResponse } from '@/src/types/api';
import { endSession, startSession, type Session } from '@/src/storage/session';
import { API_CONFIGURED, request } from './http';
import { mockLogin } from './mocks/servidor';

/**
 * Entra com e-mail e senha e grava a sessão. Com "Lembrar de mim" desmarcado,
 * a sessão fica só em memória. O cadastro (Sign up) segue no mock e não passa
 * por aqui: a API não tem cadastro público.
 */
export async function signIn(email: string, senha: string, remember: boolean): Promise<Session> {
  const credentials = { email: email.trim(), senha };
  const auth = API_CONFIGURED
    ? await request<AuthResponse>('/auth/login', { method: 'POST', body: credentials, auth: false })
    : await mockLogin(credentials);
  return startSession(auth, credentials.email, remember);
}

/** A API não tem logout: sair apaga só a sessão do aparelho. */
export function signOut(): Promise<void> {
  return endSession('logout');
}
