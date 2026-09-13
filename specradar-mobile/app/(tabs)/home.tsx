import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { loadHistory } from '@/src/storage/history';
import type { Ficha } from '@/src/types/spec';
import { parseApiDate } from '@/src/api/adapters';
import { Pill } from '@/src/components/radar-ui';
import { HomeBackground } from '@/src/components/screen-background';
import { VehicleCarousel } from '@/src/components/vehicle-carousel';
import { VEHICLES } from '@/src/data/vehicles';

export default function HomeScreen() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [history, setHistory] = useState<Ficha[]>([]);
  const search = useRef<TextInput>(null);
  useFocusEffect(useCallback(() => { let mounted = true; loadHistory().then(items => { if (mounted) setHistory(items); }).catch(() => { if (mounted) setHistory([]); }); return () => { mounted = false; }; }, []));
  const filtered = VEHICLES.filter(car => (category === 'Todos' || car.category === category) && `Ford ${car.model}`.toLowerCase().includes(query.toLowerCase().trim()));
  function changeFilter(value: string) { setCategory(value); }

  return <HomeBackground><ScrollView style={s.screen} contentContainerStyle={s.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
    <View style={s.top}><Text style={s.brand}>✳ SPECRADAR</Text><Link href="/(tabs)/historico" asChild><Pressable accessibilityRole="button" accessibilityLabel="Abrir histórico" style={s.circle}><MaterialIcons name="history" size={22} color="#fff" /></Pressable></Link></View>
    <View style={s.heading}><View style={{ flex: 1, gap: 8 }}><Text accessibilityRole="header" style={s.title}>Encontre seu{ '\n' }próximo caminho.</Text><Text style={s.subtitle}>Cada detalhe. Uma escolha melhor.</Text></View><Pressable onPress={() => search.current?.focus()} accessibilityRole="button" accessibilityLabel="Pesquisar veículos" style={s.circle}><MaterialIcons name="search" size={23} color="#fff" /></Pressable></View>
    <View style={s.search}><MaterialIcons name="search" size={21} color="#52728B" /><TextInput ref={search} value={query} onChangeText={value => { setQuery(value); }} placeholder="Buscar marca ou modelo" placeholderTextColor="#52728B" accessibilityLabel="Buscar marca ou modelo" style={s.input} returnKeyType="search" />{query ? <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Limpar busca"><MaterialIcons name="close" size={22} color="#52728B" /></Pressable> : <Link href="/(tabs)/formulario" asChild><Pressable accessibilityRole="button" accessibilityLabel="Abrir filtros da consulta" style={{ padding: 6 }}><MaterialIcons name="tune" size={20} color="#52728B" /></Pressable></Link>}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{['Todos', 'SUVs', 'Hatches'].map(item => <Pill key={item} label={item} selected={category === item} onPress={() => changeFilter(item)} />)}</ScrollView>
    <View style={s.section}><Text style={s.sectionTitle}>Explore os modelos</Text><Text style={s.small}>{filtered.length} opções · deslize</Text></View>
    <VehicleCarousel vehicles={filtered} onSelect={car => router.push({ pathname: '/(tabs)/formulario', params: { marca: 'Ford', modelo: car.model } })} />
    {!filtered.length && <View style={s.noResults}><Text style={s.darkTitle}>Nenhum modelo encontrado</Text><Text style={s.darkDescription}>Tente outra busca ou consulte pela API.</Text><Link href="/(tabs)/formulario" style={s.link}>Abrir consulta</Link></View>}
    <Link href="/api" asChild><Pressable accessibilityRole="button" style={s.recent}><View style={s.recentIcon}><MaterialIcons name="api" size={24} color="#315D7B" /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.darkTitle}>API SpecRadar</Text><Text style={s.darkDescription}>Veja a fonte dos dados e abra uma consulta.</Text></View><MaterialIcons name="north-east" size={22} color="#315D7B" /></Pressable></Link>
    <View style={s.section}><Text style={s.sectionTitle}>Seu radar</Text><Link href="/(tabs)/historico" style={s.small}>Ver histórico ↗</Link></View>
    {history.length > 0 ? history.slice(0, 2).map(item => <Link key={item.id} href={{ pathname: '/ficha/[id]', params: { id: item.id } }} asChild><Pressable accessibilityRole="button" style={s.recent}><View style={s.recentIcon}><MaterialIcons name="directions-car" size={24} color="#315D7B" /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.darkTitle}>{item.marca} {item.modelo}</Text><Text style={s.darkDescription}>{item.versao} · {parseApiDate(item.consultado_em)?.toLocaleDateString('pt-BR') ?? ''}</Text></View><MaterialIcons name="north-east" size={22} color="#315D7B" /></Pressable></Link>) : <Link href="/(tabs)/chat" asChild><Pressable accessibilityRole="button" style={s.recent}><View style={s.recentIcon}><MaterialIcons name="chat-bubble-outline" size={24} color="#315D7B" /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.darkTitle}>Vamos descobrir juntos?</Text><Text style={s.darkDescription}>Busque seu primeiro carro no chat.</Text></View><MaterialIcons name="north-east" size={22} color="#315D7B" /></Pressable></Link>}
    <View style={s.actions}>{[{ title: 'Análise guiada', text: 'Escolha os atributos', icon: 'tune' as const, href: '/(tabs)/formulario' as const }, { title: 'Comparar', text: 'Detalhes lado a lado', icon: 'compare-arrows' as const, href: '/(tabs)/comparar' as const }].map(action => <Link key={action.title} href={action.href} asChild><Pressable accessibilityRole="button" style={s.action}><MaterialIcons name={action.icon} size={24} color="#315D7B" /><Text style={s.darkTitle}>{action.title}</Text><Text style={s.darkDescription}>{action.text}</Text></Pressable></Link>)}</View>
    <Text style={s.footer}>SPECRADAR / INTELIGÊNCIA AUTOMOTIVA</Text>
  </ScrollView></HomeBackground>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' }, content: { padding: 22, gap: 18, paddingBottom: 30, width: '100%', maxWidth: 620, alignSelf: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#fff' }, circle: { width: 44, height: 44, borderRadius: 24, backgroundColor: '#ffffff20', justifyContent: 'center', alignItems: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 14 }, title: { fontSize: 32, lineHeight: 37, fontWeight: '600', letterSpacing: -0.8, color: '#fff' }, subtitle: { color: '#F3F8FC', fontSize: 13 }, search: { minHeight: 52, borderRadius: 28, backgroundColor: '#E5EFF6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 }, input: { flex: 1, minWidth: 0, fontSize: 14, color: '#182E40', paddingVertical: 12 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, sectionTitle: { fontSize: 19, fontWeight: '600', color: '#fff', letterSpacing: -0.3 }, small: { fontSize: 11, color: '#fff' },
  recent: { borderRadius: 24, backgroundColor: '#EAF2F8', padding: 16, gap: 12, flexDirection: 'row', alignItems: 'center' }, recentIcon: { width: 44, height: 44, borderRadius: 24, backgroundColor: '#D6E5F0', justifyContent: 'center', alignItems: 'center' }, darkTitle: { color: '#182E40', fontSize: 16, fontWeight: '600' }, darkDescription: { color: '#5E7485', fontSize: 12, lineHeight: 18 }, actions: { flexDirection: 'row', gap: 12 }, action: { flex: 1, borderRadius: 24, backgroundColor: '#EAF2F8', padding: 17, gap: 10 }, footer: { color: '#E7F0F7', fontSize: 9, letterSpacing: 1.5, textAlign: 'center', marginTop: 5 }, noResults: { padding: 22, gap: 14, backgroundColor: '#EAF2F8', borderRadius: 26 }, link: { color: '#315D7B', fontWeight: '600', paddingVertical: 8 },
});
