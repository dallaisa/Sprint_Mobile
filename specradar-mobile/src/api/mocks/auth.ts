import { TokenResponse } from '@/src/types/auth';

const USUARIOS_MOCK = [
  { email: 'admin@specradar.com', senha: 'Admin@2026', nome: 'Admin Usuário', role: 'ADMIN' },
  { email: 'analista@specradar.com', senha: 'Analista@2026', nome: 'Analista Demo', role: 'ANALISTA' },
];

const registeredEmails = new Set(USUARIOS_MOCK.map((u) => u.email));

export async function mockLogin(email: string, senha: string): Promise<TokenResponse> {
  await new Promise((r) => setTimeout(r, 700));
  const user = USUARIOS_MOCK.find((u) => u.email === email && u.senha === senha);
  if (!user) {
    const err = new Error('E-mail ou senha incorretos.') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  const expiraEm = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  return {
    token: `mock-jwt-${user.role.toLowerCase()}-${Date.now()}`,
    tipo: 'Bearer',
    expiraEm,
  };
}

export async function mockRegister(nome: string, email: string, _senha: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 700));
  if (registeredEmails.has(email)) {
    const err = new Error('E-mail já cadastrado.') as Error & { status: number };
    err.status = 409;
    throw err;
  }
  registeredEmails.add(email);
}
