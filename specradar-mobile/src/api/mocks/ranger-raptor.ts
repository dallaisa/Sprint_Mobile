import { SpecResponse } from '@/src/types/spec';

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
    potencia_cv: {
      valor: 213,
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    torque_nm: {
      valor: 500,
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
    peso_kg: {
      valor: 2350,
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    comprimento_mm: {
      valor: 5398,
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    largura_mm: {
      valor: 1910,
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    altura_mm: {
      valor: 1910,
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    capacidade_carga_kg: {
      valor: 750,
      confianca: 'alta',
      fonte: 'Ford Brasil — catálogo oficial 2024',
      verificado_em: '2024-09-01',
    },
    preco_base_brl: {
      valor: 459990,
      confianca: 'inferida',
      fonte: 'Ford Brasil — tabela de preços set/2024',
      verificado_em: '2024-09-15',
    },
    consumo_cidade: {
      valor: '9,5 km/l',
      confianca: 'inferida',
      fonte: 'INMETRO — ciclo urbano estimado',
      verificado_em: '2024-08-01',
    },
    consumo_estrada: {
      valor: '12,0 km/l',
      confianca: 'inferida',
      fonte: 'INMETRO — ciclo rodoviário estimado',
      verificado_em: '2024-08-01',
    },
  },
};
