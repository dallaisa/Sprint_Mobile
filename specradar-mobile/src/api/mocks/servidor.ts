// Modo demonstração no formato real da API, usado quando EXPO_PUBLIC_API_BASE_URL
// não está configurada. Qualquer veículo recebe os valores de exemplo da Ranger
// Raptor; o que não tem exemplo volta como NAO_ENCONTRADO, como na API.

import type {
  AuthResponse, CampoSpec, ChatMessageRequest, ChatResponse, CompareResponse,
  ConfiancaGeral, LoginRequest, SpecQueryRequest, SpecResponse, VeiculoRef,
} from '@/src/types/api';
import { ATRIBUTOS_PADRAO, buscarAtributo } from '@/src/data/atributos';
import { fichaId } from '../adapters';
import { ApiError } from '../http';
import { USUARIOS_MOCK } from './auth';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CATALOGO_OFICIAL = { fonte: 'Ford Brasil — catálogo oficial 2024', verificado_em: '2024-09-01' };

const EXEMPLOS: Record<string, Omit<CampoSpec, 'campo'>> = {
  motor: { valor: '2.0L EcoBlue Biturbo Diesel', confianca: 'ALTA', ...CATALOGO_OFICIAL },
  potencia: { valor: '213 cv', confianca: 'ALTA', ...CATALOGO_OFICIAL },
  torque: { valor: '500 Nm', confianca: 'ALTA', ...CATALOGO_OFICIAL },
  transmissao: { valor: 'Automática 10 velocidades SelectShift', confianca: 'ALTA', ...CATALOGO_OFICIAL },
  tracao: { valor: '4x4 com diferencial traseiro bloqueável', confianca: 'ALTA', ...CATALOGO_OFICIAL },
  dimensoes: { valor: '5.398 x 1.910 x 1.910 mm', confianca: 'MEDIA', ...CATALOGO_OFICIAL },
  preco: { valor: 'R$ 459.990', confianca: 'INFERIDA', fonte: 'Ford Brasil — tabela de preços set/2024', verificado_em: '2024-09-15' },
  consumo: { valor: '9,5 km/l', confianca: 'INFERIDA', fonte: 'INMETRO — ciclo urbano estimado', verificado_em: '2024-08-01' },
};

// Fichas "salvas no banco" durante a sessão do app, como o cache da API.
const catalogo = new Map<string, SpecResponse>();

function campoDemo(atributo: string): CampoSpec {
  const campo = atributo.trim().toLowerCase();
  const exemplo = EXEMPLOS[campo];
  return exemplo
    ? { campo, ...exemplo }
    : { campo, valor: null, confianca: 'NAO_ENCONTRADO', fonte: null, verificado_em: null };
}

/** Mesma regra da API (SpecService.calcularConfidenceGeral). */
function confiancaGeral(campos: CampoSpec[]): ConfiancaGeral {
  if (!campos.length) return 'BAIXA';
  const alta = campos.filter(campo => campo.confianca === 'ALTA').length / campos.length;
  const ausentes = campos.filter(campo => campo.confianca === 'NAO_ENCONTRADO').length / campos.length;
  if (alta >= 0.8) return 'ALTA';
  if (ausentes >= 0.5) return 'BAIXA';
  if (alta >= 0.5) return 'MEDIA';
  return 'PARCIAL';
}

/** LocalDateTime como a API envia: horário local, sem fuso. */
function agoraLocal(): string {
  const data = new Date();
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}T${dois(data.getHours())}:${dois(data.getMinutes())}:${dois(data.getSeconds())}`;
}

function naoEncontrada(veiculo: VeiculoRef): ApiError {
  const sugestoes = [...catalogo.values()]
    .filter(ficha => ficha.marca.toLowerCase() === veiculo.marca.trim().toLowerCase() &&
      ficha.modelo.toLowerCase() === veiculo.modelo.trim().toLowerCase())
    .map(ficha => `${ficha.marca} ${ficha.modelo} ${ficha.versao}`)
    .slice(0, 5);
  return new ApiError(404, 'NOT_FOUND',
    `Ficha técnica não encontrada para: ${veiculo.marca} ${veiculo.modelo} ${veiculo.versao}. Use POST /api/v1/specs/query para consultar e armazenar a ficha deste veículo.`,
    { sugestoes });
}

export async function mockLogin({ email, senha }: LoginRequest): Promise<AuthResponse> {
  await wait(700);
  const usuario = USUARIOS_MOCK.find(item => item.email === email.trim().toLowerCase() && item.senha === senha);
  if (!usuario) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos.');
  return {
    access_token: `mock-access-${Date.now()}`,
    refresh_token: `mock-refresh-${Date.now()}`,
    token_type: 'Bearer',
    expires_in: 8 * 60 * 60,
    role: usuario.role === 'ADMIN' ? 'ADMIN' : 'ANALYST',
  };
}

export async function mockQuerySpec(query: SpecQueryRequest): Promise<SpecResponse> {
  await wait(800);
  const veiculo = { marca: query.marca.trim(), modelo: query.modelo.trim(), versao: query.versao.trim() };
  const id = fichaId(veiculo);
  const existente = catalogo.get(id);
  const pedidos = query.atributos.map(atributo => atributo.trim().toLowerCase());
  const salva: SpecResponse = existente ?? { ...veiculo, campos: [], confidence_geral: 'BAIXA', consultado_em: agoraLocal(), cache_hit: true };

  // Como a API: a primeira consulta já guarda o conjunto padrão; depois, só completa o que faltar.
  const desejados = existente ? pedidos : [...new Set([...pedidos, ...ATRIBUTOS_PADRAO])];
  const faltando = desejados.filter(atributo => !salva.campos.some(campo => campo.campo === atributo));
  const cacheHit = !!existente && faltando.length === 0;
  if (!cacheHit) {
    salva.campos = [...salva.campos, ...faltando.map(campoDemo)];
    salva.confidence_geral = confiancaGeral(salva.campos);
    salva.consultado_em = agoraLocal();
    catalogo.set(id, salva);
  }

  const campos = pedidos.map(atributo => salva.campos.find(campo => campo.campo === atributo) ?? campoDemo(atributo));
  return { ...salva, campos, cache_hit: cacheHit };
}

export async function mockGetFicha(veiculo: VeiculoRef): Promise<SpecResponse> {
  await wait(300);
  const ficha = catalogo.get(fichaId(veiculo));
  if (!ficha) throw naoEncontrada(veiculo);
  return { ...ficha, cache_hit: true };
}

export async function mockCompare(v1: VeiculoRef, v2: VeiculoRef, atributos?: string[]): Promise<CompareResponse> {
  const [ficha1, ficha2] = await Promise.all([mockGetFicha(v1), mockGetFicha(v2)]);
  const lista = atributos?.length ? atributos : ficha1.campos.map(campo => campo.campo);
  return {
    veiculo1: v1,
    veiculo2: v2,
    comparativo: lista.map(atributo => {
      const campo1 = ficha1.campos.find(campo => campo.campo === atributo) ?? campoDemo(atributo);
      const campo2 = ficha2.campos.find(campo => campo.campo === atributo) ?? campoDemo(atributo);
      // No modo demonstração os dois veículos têm os mesmos valores.
      const comparavel = buscarAtributo(atributo)?.vencedor && campo1.valor !== null && campo2.valor !== null;
      return { atributo, veiculo1: campo1, veiculo2: campo2, vencedor: comparavel ? 'EMPATE' : 'N/A' };
    }),
  };
}

export async function mockHistory(filtro: { marca?: string; modelo?: string }): Promise<SpecResponse[]> {
  await wait(300);
  const contem = (valor: string, busca?: string) => !busca || valor.toLowerCase().includes(busca.trim().toLowerCase());
  return [...catalogo.values()]
    .filter(ficha => contem(ficha.marca, filtro.marca) && contem(ficha.modelo, filtro.modelo))
    .reverse();
}

const MODELOS_RECONHECIDOS: Record<string, string[]> = {
  ford: ['ranger', 'territory', 'bronco', 'maverick', 'edge', 'expedition'],
  toyota: ['hilux', 'corolla', 'yaris', 'sw4'],
  chevrolet: ['s10', 'tracker', 'onix', 'cruze'],
};

// Parte da lista do ChatService, na mesma ordem de prioridade.
const VERSOES_RECONHECIDAS = ['raptor', 'gr-sport', 'high country', 'wildtrak', 'limited', 'platinum', 'titanium', 'sport'];

// Como a API: só a primeira letra maiúscula ("High country").
const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** Versão simplificada do ChatService: reconhece marca, modelo e versão de listas fixas. */
export async function mockChat({ mensagem }: ChatMessageRequest): Promise<ChatResponse> {
  const texto = mensagem.toLowerCase();
  const marca = Object.keys(MODELOS_RECONHECIDOS).find(item => texto.includes(item));
  const modelo = marca && MODELOS_RECONHECIDOS[marca].find(item => texto.includes(item));
  const versao = VERSOES_RECONHECIDAS.find(item => texto.includes(item));
  if (!marca || !modelo) {
    await wait(400);
    return {
      mensagem: "Não consegui identificar o veículo na sua mensagem. Tente algo como: 'Especificações da Toyota Hilux 2025' ou 'Motor e potência da Chevrolet S10 High Country'",
      ficha: null,
      sucesso: false,
    };
  }
  const ficha = await mockQuerySpec({
    marca: capitalizar(marca),
    modelo: capitalizar(modelo),
    versao: versao ? capitalizar(versao) : 'base',
    atributos: ATRIBUTOS_PADRAO,
  });
  return { mensagem: `Encontrei as especificações da **${ficha.marca} ${ficha.modelo} ${ficha.versao}**:\n\n`, ficha, sucesso: true };
}
