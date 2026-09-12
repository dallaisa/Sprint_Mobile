export const VEHICLES = [
  { model: 'EcoSport', category: 'SUVs', tagline: 'Seu próximo destino', analysis: 'Motor, tração e dimensões', image: require('../../assets/carro4.png') },
  { model: 'Ka', category: 'Hatches', tagline: 'Novos caminhos pela cidade', analysis: 'Consumo, peso e desempenho', image: require('../../assets/carro2.png') },
  { model: 'Edge', category: 'SUVs', tagline: 'Explore cada detalhe', analysis: 'Potência, torque e transmissão', image: require('../../assets/carro3.png') },
  { model: 'Fiesta', category: 'Hatches', tagline: 'A cidade espera por você', analysis: 'Dimensões e consumo urbano', image: require('../../assets/carro1.png') },
];

export type Vehicle = typeof VEHICLES[number];
