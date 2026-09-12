import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { querySpec } from '@/src/api/client';
import { saveToHistory } from '@/src/storage/history';
import { ATRIBUTOS_PADRAO, Colors } from '@/src/theme/colors';
import type { SpecResponse } from '@/src/types/spec';
import { VEHICLES } from '@/src/data/vehicles';
import { PageIntro, ui } from './radar-ui';

export const COMPARISON_OPTIONS = [
  ...VEHICLES.map(vehicle => ({ brand: 'Ford', model: vehicle.model, category: vehicle.category, image: vehicle.image as number | undefined })),
  { brand: 'Ford', model: 'Ranger', category: 'Picapes', image: require('../../assets/ranger.png') as number },
  { brand: 'Ford', model: 'Bronco Sport', category: 'SUVs', image: require('../../assets/bronco.png') as number },
  { brand: 'Ford', model: 'Territory', category: 'SUVs', image: require('../../assets/territory.png') as number },
  { brand: 'Ford', model: 'Maverick', category: 'Picapes', image: require('../../assets/maverick.png') as number },
  { brand: 'Ford', model: 'Mustang', category: 'Esportivos', image: require('../../assets/mustang.jpeg') as number },
  { brand: 'Ford', model: 'Fusion', category: 'Sedãs', image: require('../../assets/fusion.jpeg') as number },
  { brand: 'Toyota', model: 'Hilux', category: 'Picapes', image: require('../../assets/hilux.png') as number },
  { brand: 'Chevrolet', model: 'S10', category: 'Picapes', image: require('../../assets/s10.jpeg') as number },
];

export function ComparisonPicker({ onCompare }: { onCompare: (first: SpecResponse, second: SpecResponse) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const options = COMPARISON_OPTIONS.filter(vehicle => normalize(`${vehicle.brand} ${vehicle.model} ${vehicle.category}`).includes(normalize(search.trim())));

  async function compare() {
    if (selected.length !== 2 || pending.current) return;
    pending.current = true;
    setLoading(true);
    setError('');
    try {
      const chosen = selected.map(key => COMPARISON_OPTIONS.find(vehicle => `${vehicle.brand} ${vehicle.model}` === key)!);
      const [first, second] = await Promise.all(chosen.map(vehicle => querySpec({ marca: vehicle.brand, modelo: vehicle.model, atributos: ATRIBUTOS_PADRAO })));
      if (!mounted.current) return;
      await saveToHistory(first);
      await saveToHistory(second);
      if (mounted.current) onCompare(first, second);
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : 'Não foi possível comparar. Tente novamente.');
    } finally {
      pending.current = false;
      if (mounted.current) setLoading(false);
    }
  }

  return <View style={s.panel}>
    <PageIntro eyebrow="12 MODELOS PARA EXPLORAR" title="Quais carros vamos comparar?" description="Selecione dois modelos para ver os atributos lado a lado." />
    <View style={s.search}><MaterialIcons name="search" size={20} color={Colors.fordBlue} /><TextInput accessibilityLabel="Buscar carros para comparar" value={search} onChangeText={setSearch} placeholder="Marca, modelo ou categoria" style={s.input} editable={!loading} /></View>
    <View style={s.selection}>{selected.length ? selected.map((key, index) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Remover ${key}`} disabled={loading} onPress={() => setSelected(current => current.filter(item => item !== key))} style={s.chip}><Text style={s.chipText}>{index + 1}. {key} ×</Text></Pressable>) : <Text style={ui.description}>Nenhum carro selecionado</Text>}</View>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: selected.length !== 2 || loading }} disabled={selected.length !== 2 || loading} onPress={compare} style={[ui.button, (selected.length !== 2 || loading) && { opacity: 0.45 }]}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={ui.buttonText}>Comparar selecionados · {selected.length}/2</Text>}</Pressable>
    {!process.env.EXPO_PUBLIC_API_BASE_URL && <Text style={s.note}>Modo demonstração: os valores retornados usam a ficha de exemplo da Ranger Raptor, não as especificações reais de cada modelo.</Text>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <View style={s.grid}>{options.map(vehicle => {
      const key = `${vehicle.brand} ${vehicle.model}`;
      const index = selected.indexOf(key);
      const disabled = loading || (selected.length === 2 && index < 0);
      return <Pressable key={key} accessibilityRole="checkbox" accessibilityLabel={key} accessibilityState={{ checked: index >= 0, disabled }} disabled={disabled} onPress={() => { setError(''); setSelected(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]); }} style={[s.card, index >= 0 && s.active, disabled && index < 0 && { opacity: 0.5 }]}>
        {vehicle.image ? <Image source={vehicle.image} style={s.image} resizeMode="cover" accessibilityLabel={key} /> : <View style={s.placeholder}><MaterialIcons name="directions-car" size={40} color="#769DC1" /></View>}
        <View style={s.copy}><Text style={s.brand}>{vehicle.brand} · {vehicle.category}</Text><Text style={s.model}>{vehicle.model}</Text><Text style={s.pick}>{index >= 0 ? `${index + 1}º selecionado ✓` : 'Selecionar +'}</Text></View>
      </Pressable>;
    })}</View>
    {!options.length && <Text style={ui.description}>Nenhum carro encontrado. Tente outra busca.</Text>}
  </View>;
}

const s = StyleSheet.create({
  panel: { backgroundColor: '#F4F8FDF5', borderRadius: 28, padding: 18, gap: 16 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E3EDF6', paddingHorizontal: 14, borderRadius: 26 },
  input: { flex: 1, minWidth: 0, minHeight: 48, color: Colors.textPrimary, fontSize: 13 },
  selection: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 22, backgroundColor: '#D9E8F4', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  chipText: { color: Colors.fordBlue, fontSize: 12, fontWeight: '600' },
  note: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17 },
  error: { color: Colors.error, fontSize: 13, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48%', flexGrow: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 2, borderColor: '#DFE8F0' },
  active: { borderColor: Colors.fordBlue, backgroundColor: '#E8F1F8' },
  image: { width: '100%', height: 95 },
  placeholder: { height: 95, backgroundColor: '#DFEAF3', justifyContent: 'center', alignItems: 'center' },
  copy: { padding: 12, gap: 6 },
  brand: { color: Colors.textSecondary, fontSize: 10 },
  model: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  pick: { color: Colors.fordBlue, fontSize: 11, fontWeight: '600' },
});
