import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/src/theme/colors';
import { ATRIBUTOS_PADRAO, GRUPOS_ATRIBUTO, atributosDoGrupo, type Atributo, type GrupoAtributo } from '@/src/data/atributos';

const keysOf = (grupo: GrupoAtributo) => atributosDoGrupo(grupo).map(atributo => atributo.chave);
const presets = [
  { name: 'Completa', icon: 'dashboard' as const, keys: ATRIBUTOS_PADRAO as string[], color: '#507EB0' },
  { name: 'Desempenho', icon: 'speed' as const, keys: keysOf('desempenho'), color: '#356599' },
  { name: 'Economia', icon: 'eco' as const, keys: keysOf('economia'), color: '#447F9F' },
  { name: 'Espaço', icon: 'straighten' as const, keys: keysOf('espaco'), color: '#647BB3' },
];
const labelOf = (atributo: Atributo) => atributo.unidade ? `${atributo.rotulo} (${atributo.unidade})` : atributo.rotulo;
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
    {open && <View style={{ gap: 18, paddingTop: 18 }}>{(Object.keys(GRUPOS_ATRIBUTO) as GrupoAtributo[]).map(grupo => <View key={grupo} style={{ gap: 6 }}><Text style={s.group}>{GRUPOS_ATRIBUTO[grupo]}</Text>{atributosDoGrupo(grupo).map(atributo => <View key={atributo.chave} style={s.row}><Text style={s.attribute}>{labelOf(atributo)}</Text><Switch accessibilityLabel={labelOf(atributo)} disabled={disabled} value={selected.includes(atributo.chave)} onValueChange={value => onChange(value ? [...selected, atributo.chave] : selected.filter(item => item !== atributo.chave))} trackColor={{ false: '#D9E4EE', true: '#82AED7' }} thumbColor="#fff" /></View>)}</View>)}</View>}
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
