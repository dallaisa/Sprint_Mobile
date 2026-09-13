export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  role: 'ANALISTA' | 'ADMIN';
}

export interface BackendError {
  status: number;
  erro: string;
  mensagem: string;
  path: string;
  timestamp: string;
}
