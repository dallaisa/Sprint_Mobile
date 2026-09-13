import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { ATRIBUTOS_PADRAO, rotuloAtributo } from '@/src/data/atributos';
import type { Ficha } from '@/src/types/spec';
import { HOME_GRADIENT } from './screen-background';

export function CoverageChart({ history }: { history: Ficha[] }) {
  const [mode, setMode] = useState('Disponíveis');
  const [selected, setSelected] = useState<string>('potencia');
  const counts = ATRIBUTOS_PADRAO.map(key => history.filter(item => { const field = item.atributos[key]; return field && field.valor !== null && (mode === 'Alta confiança' ? field.confianca === 'ALTA' : field.confianca !== 'NAO_ENCONTRADO'); }).length);
  const value = counts[ATRIBUTOS_PADRAO.indexOf(selected as (typeof ATRIBUTOS_PADRAO)[number])];
  return <View style={s.panel}><View style={s.heading}><Text accessibilityRole="header" style={s.title}>Por dentro dos dados</Text><Text style={s.count}>{history.length} fichas</Text></View><Text style={s.description}>Cobertura dos atributos no seu histórico</Text><View style={s.filters}>{['Disponíveis', 'Alta confiança'].map(label => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: mode === label }} onPress={() => setMode(label)} style={[s.filter, mode === label && s.filterActive]}><Text style={[s.filterText, mode === label && s.filterTextActive]}>{label}</Text></Pressable>)}</View><View style={s.bars}>{ATRIBUTOS_PADRAO.map((key, index) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`${rotuloAtributo(key)}: ${counts[index]} de ${history.length} fichas`} accessibilityState={{ selected: key === selected }} onPress={() => setSelected(key)} style={s.barTouch}><View style={[s.bar, { height: counts[index] ? 10 + (counts[index] / Math.max(history.length, 1)) * 65 : 3, backgroundColor: key === selected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)' }]} /><View style={[s.dot, key === selected && { backgroundColor: '#FFFFFF' }]} /></Pressable>)}</View><View style={s.caption}><Text style={s.label}>{rotuloAtributo(selected)}</Text><Text selectable style={s.value}>{value} / {history.length} fichas</Text></View><Text style={s.note}>{history.length ? 'Toque nas barras para explorar cada atributo.' : 'Suas consultas vão preencher este gráfico. Comece pelo chat.'}</Text></View>;
}
const s = StyleSheet.create({
  panel: { width: '100%', minWidth: 0, backgroundColor: '#507EB0', experimental_backgroundImage: HOME_GRADIENT, borderRadius: 28, overflow: 'hidden', padding: 20, gap: 14 },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { color: '#fff', fontSize: 18, fontWeight: '600', flexShrink: 1 },
  count: { fontSize: 11, color: '#fff' },
  description: { fontSize: 12, lineHeight: 18, color: '#fff' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFFFFF80', backgroundColor: '#315D7B' },
  filterActive: { backgroundColor: '#fff', borderColor: '#fff' },
  filterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: Colors.fordBlue },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 100, borderBottomWidth: 1, borderBottomColor: '#FFFFFF80', gap: 4 },
  barTouch: { flex: 1, minWidth: 0, height: 100, justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF80', marginBottom: 5 },
  caption: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  label: { color: '#fff', fontSize: 13, flexShrink: 1 },
  value: { color: '#fff', fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  note: { color: '#fff', fontSize: 11, lineHeight: 17 },
});
