import { SpecResponse } from '@/src/types/spec';

/**
 * Mock da Ford Ranger Raptor — caso de teste oficial do brief da Ford.
 *
 * Usado quando EXPO_PUBLIC_API_BASE_URL está ausente, e como plano B na
 * apresentação caso a API não suba. Por isso as chaves seguem exatamente
 * o vocabulário de ATRIBUTOS_API (espelho do backend) e os valores imitam
 * o formato que o backend devolve: sempre string COM unidade, nunca
 * número puro — é da unidade que a comparação extrai o número.
 *
 * ATENÇÃO — dado herdado a conferir: motor/potência/torque abaixo vieram
 * do mock anterior e descrevem a Ranger 2.0 biturbo diesel, não a Raptor
 * (que no Brasil é 3.0 V6 EcoBoost a gasolina, ~397 cv). Mantido como
 * estava para não misturar correção de dado com este refactor.
 */
export const rangerRaptorMock: SpecResponse = {
  id: 'ford-ranger-raptor-2024',
  marca: 'Ford',
  modelo: 'Ranger Raptor',
  versao: '2024',
  consultado_em: new Date().toISOString(),
  atributos: {
    motor: {
      valor: '2.0L EcoBlue Biturbo Diesel',
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    potencia: {
      valor: '213 cv',
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    torque: {
      valor: '500 Nm',
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    transmissao: {
      valor: 'Automática 10 velocidades SelectShift',
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    tracao: {
      valor: '4x4 com diferencial traseiro bloqueável',
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    amortecedores: {
      valor: 'Fox Racing 2.5 Live Valve com reservatório externo',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
    aceleracao: {
      valor: '10,5 segundos',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
    modos_conducao: {
      valor: 'Normal, Sport, Grama/Cascalho/Neve, Lama/Sulco, Areia, Baja',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
    farois: {
      valor: 'Full LED com assinatura em C e faróis de neblina',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
    rodas_pneus: {
      valor: 'Aro 17" com pneus BFGoodrich All-Terrain KO2 285/70 R17',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
    preco: {
      valor: 'R$ 459.990,00',
      confianca: 'inferida',
      fonte: 'Ford Brasil — tabela de preços set/2024',
      verificado_em: '2024-09-15',
    },
    // O backend concatena cidade e estrada num campo só. A extração
    // numérica pega o PRIMEIRO "km/l" da string — por isso cidade vem
    // primeiro, e a mesma ordem precisa valer para todo veículo, senão
    // a comparação mistura ciclo urbano com rodoviário.
    consumo: {
      valor: '9,5 km/l (cidade) / 12,0 km/l (estrada)',
      confianca: 'inferida',
      fonte: 'INMETRO — ciclos urbano e rodoviário estimados',
      verificado_em: '2024-08-01',
    },
    dimensoes: {
      valor: '5398 × 1910 × 1910 mm',
      confianca: 'inferida',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    modos_volante: {
      valor: 'Normal e Sport (assistência variável)',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
    modos_escapamento: {
      valor: 'Quiet, Normal, Sport, Baja',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
    modos_amortecedor: {
      valor: 'Normal e Sport (Live Valve adaptativo)',
      confianca: 'inferida',
      fonte: 'Mock de desenvolvimento — valor plausível, não verificado',
      verificado_em: null,
    },
  },
};
