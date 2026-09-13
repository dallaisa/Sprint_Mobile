import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SpecResponse } from '@/src/types/spec';
import { Colors } from '@/src/theme/colors';
import { SpecCard } from './SpecCard';
import { ConfidenceBadge } from './ConfidenceBadge';

const groups = [
  { label: 'Desempenho', keys: ['potencia_cv', 'torque_nm'] },
  { label: 'Economia', keys: ['consumo_cidade', 'consumo_estrada', 'preco_base_brl'] },
  { label: 'Espaço', keys: ['capacidade_carga_kg', 'comprimento_mm', 'largura_mm', 'altura_mm', 'peso_kg'] },
];
const labels: Record<string, [string, string]> = {
  potencia_cv: ['Potência', 'cv'], torque_nm: ['Torque', 'Nm'],
  consumo_cidade: ['Consumo na cidade', 'km/l'], consumo_estrada: ['Consumo na estrada', 'km/l'],
  preco_base_brl: ['Preço base', 'R$'], capacidade_carga_kg: ['Capacidade de carga', 'kg'],
  comprimento_mm: ['Comprimento', 'mm'], largura_mm: ['Largura', 'mm'], altura_mm: ['Altura', 'mm'], peso_kg: ['Peso', 'kg'],
};

export function ChatSpecResult({ spec }: { spec: SpecResponse }) {
  const [category, setCategory] = useState(0);
  const [details, setDetails] = useState(false);
  const fields = Object.values(spec.atributos);
  const available = fields.filter(field => field.valor !== null && field.confianca !== 'nao_encontrado').length;
  const coverage = fields.length ? Math.round(available / fields.length * 100) : 0;

  return <View style={s.result}>
    <View style={s.heading}>
      <Text style={s.eyebrow}>SEU CARRO EM NÚMEROS</Text>
      <Text selectable style={s.title}>{spec.marca} {spec.modelo}</Text>
      <Text style={s.subtitle}>{spec.versao}</Text>
      {!process.env.EXPO_PUBLIC_API_BASE_URL && <Text style={s.subtitle}>Demonstração · dados de exemplo da Ranger Raptor.</Text>}
    </View>
    <View style={s.tabs}>{groups.map((group, index) => <Pressable key={group.label} accessibilityRole="button" accessibilityState={{ selected: category === index }} onPress={() => setCategory(index)} style={[s.tab, category === index && s.activeTab]}><Text style={[s.tabText, category === index && s.activeText]}>{group.label}</Text></Pressable>)}</View>
    <View style={s.grid}>{groups[category].keys.map((key, index) => {
      const field = spec.atributos[key];
      const missing = !field || field.valor === null || field.confianca === 'nao_encontrado';
      const value = missing ? '—' : typeof field.valor === 'number' ? field.valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : String(field.valor);
      return <View key={key} style={[s.metric, { backgroundColor: index % 2 ? '#D9EEEB' : '#E9F2FF' }]}>
        <Text style={s.metricLabel}>{labels[key][0]}</Text>
        <Text selectable style={[s.number, value.length > 9 && { fontSize: 24 }]}>{value}</Text>
        <Text style={s.unit}>{labels[key][1]}</Text>
        <ConfidenceBadge confianca={missing ? 'nao_encontrado' : field.confianca} />
      </View>;
    })}</View>
    <View style={s.coverage}>
      <View style={s.coverageRow}><Text style={s.coverageTitle}>Dados disponíveis</Text><Text selectable style={s.percentage}>{coverage}%</Text></View>
      <View accessible accessibilityLabel={`${available} de ${fields.length} atributos disponíveis`} style={s.track}><View style={[s.fill, { width: `${coverage}%` }]} /></View>
      <Text style={s.unit}>{available} de {fields.length} atributos encontrados</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} style={s.detailsButton}>
      <View style={{ flex: 1, gap: 4 }}><Text style={s.coverageTitle}>{details ? 'Ocultar ficha completa' : 'Ver ficha completa'}</Text><Text style={s.unit}>Motor, transmissão, fontes e exportação CSV</Text></View>
      <Text style={s.toggle}>{details ? '−' : '+'}</Text>
    </Pressable>
    {details && <View style={s.details}><SpecCard spec={spec} /></View>}
  </View>;
}

const s = StyleSheet.create({
  result: { gap: 16, width: '100%', minWidth: 0 },
  heading: { gap: 6 }, eyebrow: { color: '#fff', fontSize: 10, letterSpacing: 1.5 },
  title: { color: '#fff', fontSize: 27, fontWeight: '700' }, subtitle: { color: '#fff', fontSize: 12, lineHeight: 18 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, backgroundColor: '#315D7B', padding: 5, borderRadius: 26 },
  tab: { flexGrow: 1, minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 23 },
  activeTab: { backgroundColor: '#fff' }, tabText: { color: '#fff', fontSize: 12, fontWeight: '600' }, activeText: { color: Colors.fordBlue },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metric: { flexGrow: 1, flexBasis: '44%', minWidth: 130, padding: 16, borderRadius: 24, gap: 8 },
  metricLabel: { color: Colors.fordBlue, fontSize: 13, fontWeight: '600' },
  number: { color: Colors.textPrimary, fontSize: 36, fontWeight: '700', fontVariant: ['tabular-nums'] },
  unit: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17 },
  coverage: { backgroundColor: '#fff', padding: 18, borderRadius: 24, gap: 10 },
  coverageRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  coverageTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  percentage: { color: Colors.fordBlue, fontSize: 25, fontWeight: '700' },
  track: { height: 8, backgroundColor: '#E1EBF4', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#507EB0', borderRadius: 5 },
  detailsButton: { backgroundColor: '#fff', borderRadius: 24, padding: 18, flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 56 },
  toggle: { fontSize: 28, color: Colors.fordBlue }, details: { backgroundColor: '#F1F6FB', borderRadius: 24, padding: 14 },
});
