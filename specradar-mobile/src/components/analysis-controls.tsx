import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ATRIBUTOS_PADRAO, Colors } from '@/src/theme/colors';

const presets = [
  { name: 'Completa', icon: 'dashboard' as const, keys: ATRIBUTOS_PADRAO, color: '#507EB0' },
  { name: 'Desempenho', icon: 'speed' as const, keys: ['motor', 'potencia_cv', 'torque_nm', 'transmissao', 'tracao'], color: '#356599' },
  { name: 'Economia', icon: 'eco' as const, keys: ['preco_base_brl', 'consumo_cidade', 'consumo_estrada'], color: '#447F9F' },
  { name: 'Espaço', icon: 'straighten' as const, keys: ['peso_kg', 'comprimento_mm', 'largura_mm', 'altura_mm', 'capacidade_carga_kg'], color: '#647BB3' },
];
const labels: Record<string, string> = { motor: 'Motor', potencia_cv: 'Potência (cv)', torque_nm: 'Torque (Nm)', transmissao: 'Transmissão', tracao: 'Tração', peso_kg: 'Peso (kg)', comprimento_mm: 'Comprimento (mm)', largura_mm: 'Largura (mm)', altura_mm: 'Altura (mm)', capacidade_carga_kg: 'Capacidade de carga (kg)', preco_base_brl: 'Preço base (R$)', consumo_cidade: 'Consumo na cidade', consumo_estrada: 'Consumo na estrada' };
type Props = { selected: string[]; onChange: (keys: string[]) => void; disabled?: boolean };

export function AnalysisHero({ selected, onChange, disabled, search, onSearch }: Props & { search: string; onSearch: (value: string) => void }) {
  const active = presets.find(preset => preset.keys.length === selected.length && preset.keys.every(key => selected.includes(key)));
  return <View style={[s.hero, { experimental_backgroundImage: `linear-gradient(135deg, ${active?.color ?? '#507EB0'}, #97BDE4)` }]}>
    <View style={s.top}><MaterialIcons name="tune" size={26} color="#fff" /><Text style={s.eyebrow}>SEU RADAR, SEU CRITÉRIO</Text></View>
    <Text style={s.kicker}>Encontre os detalhes &</Text><Text style={s.title}>Explore.</Text>
    <Text style={s.subtitle}>Uma análise feita para o que importa para você.</Text>
    <View style={s.search}><MaterialIcons name="search" size={20} color="#fff" /><TextInput accessibilityLabel="Buscar modelo na análise" value={search} onChangeText={onSearch} placeholder="Qual carro você quer conhecer?" placeholderTextColor="#fff" style={s.input} editable={!disabled} /></View>
    <View style={s.shortcuts}>{presets.map(preset => <Pressable key={preset.name} accessibilityRole="button" accessibilityState={{ selected: active?.name === preset.name, disabled }} disabled={disabled} onPress={() => onChange([...preset.keys])} style={s.shortcut}><View style={[s.circle, active?.name === preset.name && s.circleActive]}><MaterialIcons name={preset.icon} size={25} color={active?.name === preset.name ? '#fff' : preset.color} /></View><Text style={s.shortcutText}>{preset.name}</Text></Pressable>)}</View>
  </View>;
}

export function AttributeSelector({ selected, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  return <View style={s.filter}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)} style={s.filterHeader}><View style={{ flex: 1, gap: 5 }}><Text style={s.filterTitle}>Personalize sua análise</Text><Text style={s.filterSubtitle}>{selected.length} atributos · toque para ajustar</Text></View><MaterialIcons name={open ? 'expand-less' : 'tune'} size={25} color={Colors.fordBlue} /></Pressable>
    {open && <View style={{ gap: 18, paddingTop: 18 }}>{presets.slice(1).map(group => <View key={group.name} style={{ gap: 6 }}><Text style={s.group}>{group.name}</Text>{group.keys.map(key => <View key={key} style={s.row}><Text style={s.attribute}>{labels[key]}</Text><Switch accessibilityLabel={labels[key]} disabled={disabled} value={selected.includes(key)} onValueChange={value => onChange(value ? [...selected, key] : selected.filter(item => item !== key))} trackColor={{ false: '#D9E4EE', true: '#82AED7' }} thumbColor="#fff" /></View>)}</View>)}</View>}
  </View>;
}
const s = StyleSheet.create({
  hero: { padding: 20, gap: 10, borderRadius: 34, borderBottomLeftRadius: 44, borderBottomRightRadius: 44, backgroundColor: '#6897C4' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }, eyebrow: { color: '#fff', fontSize: 9, letterSpacing: 1.5 },
  kicker: { color: '#fff', fontSize: 17 }, title: { color: '#fff', fontSize: 40, fontWeight: '700', letterSpacing: -1 }, subtitle: { color: '#fff', fontSize: 13, lineHeight: 20 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF26', borderRadius: 30, paddingHorizontal: 16, marginVertical: 14 }, input: { color: '#fff', fontSize: 12, minHeight: 50, flex: 1, minWidth: 0 },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, shortcut: { alignItems: 'center', gap: 9, flexGrow: 1, flexBasis: '40%' }, circle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F4F8FD', alignItems: 'center', justifyContent: 'center' }, circleActive: { backgroundColor: '#315D7B', borderWidth: 2, borderColor: '#CFE6FB' }, shortcutText: { color: '#fff', fontSize: 10 },
  filter: { backgroundColor: '#fff', borderRadius: 25, padding: 18 }, filterHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 44 }, filterTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' }, filterSubtitle: { color: Colors.textSecondary, fontSize: 12 }, group: { color: Colors.fordBlue, fontSize: 12, fontWeight: '700', marginBottom: 5 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, gap: 10 }, attribute: { color: Colors.textPrimary, fontSize: 13, flex: 1 },
});
