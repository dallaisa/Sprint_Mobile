export const USUARIOS_MOCK = [
  { email: 'admin@spec.com', senha: '123456', nome: 'Admin Usuário', role: 'ADMIN' },
];

const registeredEmails = new Set(USUARIOS_MOCK.map((u) => u.email));

export async function mockRegister(nome: string, email: string, _senha: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 700));
  if (registeredEmails.has(email)) {
    const err = new Error('E-mail já cadastrado.') as Error & { status: number };
    err.status = 409;
    throw err;
  }
  registeredEmails.add(email);
}
