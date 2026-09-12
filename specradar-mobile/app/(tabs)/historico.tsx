import { useState, useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { loadHistory } from '@/src/storage/history';
import type { SpecResponse } from '@/src/types/spec';
import { Colors } from '@/src/theme/colors';
import { EmptyPanel, Pill, ui } from '@/src/components/radar-ui';

export default function HistoricoScreen() {
  const [history, setHistory] = useState<SpecResponse[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [error, setError] = useState('');
  const router = useRouter();
  useFocusEffect(useCallback(() => {
    let active = true;
    loadHistory().then(items => { if (active) { setHistory(items); setError(''); } }).catch(() => { if (active) setError('Não foi possível carregar as consultas. Abra esta aba novamente para tentar.'); });
    setSelected(null);
    return () => { active = false; };
  }, []));
  const fields = history.flatMap(item => Object.values(item.atributos));
  const confirmed = fields.filter(field => field.confianca === 'alta' && field.valor !== null).length;
  const today = new Date().toLocaleDateString('pt-BR');
  const filtered = history.filter(item => {
    const matches = `${item.marca} ${item.modelo} ${item.versao}`.toLowerCase().includes(search.toLowerCase().trim());
    const complete = Object.values(item.atributos).length > 0 && Object.values(item.atributos).every(field => field.valor !== null && field.confianca !== 'nao_encontrado');
    return matches && (filter === 'Todas' || (filter === 'Hoje' ? new Date(item.consultado_em).toLocaleDateString('pt-BR') === today : complete));
  });
  function compare(id: string) {
    if (!selected) setSelected(id);
    else if (selected === id) setSelected(null);
    else { router.push({ pathname: '/(tabs)/comparar', params: { v1: selected, v2: id } }); setSelected(null); }
  }
  return <ScrollView style={s.screen} contentContainerStyle={ui.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
    <View style={s.hero}><Image source={require('@/assets/historico.jpg')} style={s.heroImage} resizeMode="cover" accessibilityLabel="Pasta azul de histórico" /><View style={s.heroCopy}><Text style={s.eyebrow}>SUA MEMÓRIA AUTOMOTIVA</Text><Text style={s.title}>Histórico.</Text><Text style={s.subtitle}>Cada consulta, um novo ponto de vista.</Text></View></View>
    <View style={s.metrics}>{[{ value: history.length, label: 'fichas salvas' }, { value: new Set(history.map(item => `${item.marca} ${item.modelo}`)).size, label: 'modelos vistos' }, { value: fields.length ? `${Math.round(confirmed / fields.length * 100)}%` : '—', label: 'alta confiança' }].map(metric => <View key={metric.label} style={s.metric}><Text selectable style={s.metricValue}>{metric.value}</Text><Text style={s.metricLabel}>{metric.label}</Text></View>)}</View>
    <View style={s.heading}><Text style={s.sectionTitle}>Suas descobertas</Text><Text style={s.muted}>Últimas 10 fichas</Text></View>
    <View style={s.search}><MaterialIcons name="search" size={21} color={Colors.fordBlue} /><TextInput style={s.input} accessibilityLabel="Buscar no histórico" value={search} onChangeText={setSearch} placeholder="Busque modelo, marca ou versão" placeholderTextColor={Colors.textSecondary} /></View>
    <View style={s.filters}>{['Todas', 'Hoje', 'Completas'].map(label => <Pill key={label} label={label} selected={label === filter} onPress={() => setFilter(label)} />)}</View>
    {selected && <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.selection}><Text style={s.selectionText}>Escolha a segunda ficha para comparar · Cancelar ×</Text></Pressable>}
    {!!error && <Text accessibilityRole="alert" style={{ color: Colors.error }}>{error}</Text>}
    {filtered.map(item => {
      const values = Object.values(item.atributos);
      const available = values.filter(value => value.valor !== null && value.confianca !== 'nao_encontrado').length;
      const trusted = values.filter(value => value.confianca === 'alta' && value.valor !== null).length;
      const date = new Date(item.consultado_em);
      return <View key={item.id} style={[s.card, selected === item.id && s.selectedCard]}>
        <View style={s.cardTop}><View style={s.folderTab}><Text style={s.folderLabel}>Consulta salva</Text></View><View style={s.date}><MaterialIcons name="schedule" size={12} color="#D6E8FC" /><Text style={s.dateText}>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {date.toLocaleDateString('pt-BR')}</Text></View></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${item.marca} ${item.modelo}`} onPress={() => router.push({ pathname: '/ficha/[id]', params: { id: item.id } })} style={s.cardBody}><Text style={s.cardTitle}>{item.marca} {item.modelo}</Text><Text style={s.version}>{item.versao}</Text><View style={s.badges}><Text style={s.badge}>{available}/{values.length} atributos</Text><Text style={s.badge}>{trusted} com alta confiança</Text></View></Pressable>
        <View style={s.cardBottom}><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/ficha/[id]', params: { id: item.id } })} style={s.cardAction}><Text style={s.actionText}>Ver ficha ↗</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{ selected: selected === item.id }} onPress={() => compare(item.id)} style={s.cardAction}><Text style={s.actionText}>{selected === item.id ? '1º selecionado ✓' : 'Comparar +'}</Text></Pressable></View>
      </View>;
    })}
    {!filtered.length && <EmptyPanel icon="history" title={history.length ? 'Nenhuma ficha neste filtro' : 'Sua próxima descoberta começa aqui'} description={history.length ? 'Tente outro modelo ou selecione Todas para rever as consultas.' : 'Consulte seu primeiro veículo. As fichas ficam disponíveis para revisar e comparar depois.'} href="/(tabs)/chat" action="Abrir uma consulta" />}
    <Text style={s.sectionTitle}>Continue explorando</Text>
    <View style={s.actions}>{[{ title: 'Comparar modelos', description: 'Escolha entre 12 carros e veja os detalhes lado a lado.', icon: 'compare-arrows' as const, href: '/(tabs)/comparar' as const }, { title: 'Uma análise sua', description: 'Escolha desempenho, economia ou espaço para a próxima ficha.', icon: 'tune' as const, href: '/(tabs)/formulario' as const }].map(action => <Pressable accessibilityRole="button" key={action.title} onPress={() => router.push(action.href)} style={s.action}><MaterialIcons name={action.icon} size={26} color={Colors.fordBlue} /><Text style={s.actionTitle}>{action.title}</Text><Text style={s.actionDescription}>{action.description}</Text></Pressable>)}</View>
    <View style={s.tip}><MaterialIcons name="verified" size={24} color={Colors.fordBlue} /><View style={{ flex: 1, gap: 6 }}><Text style={s.actionTitle}>Olhe além dos números</Text><Text style={s.actionDescription}>Abra uma ficha para conferir as fontes, verificar a confiança de cada atributo e exportar os dados em CSV.</Text></View></View>
  </ScrollView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background }, hero: { height: 280, borderRadius: 30, overflow: 'hidden', backgroundColor: '#F4F5FA' }, heroImage: { width: '100%', height: 220, position: 'absolute', top: -20 }, heroCopy: { position: 'absolute', bottom: 0, padding: 22, gap: 6 }, eyebrow: { color: Colors.fordBlue, fontSize: 9, letterSpacing: 1.6 }, title: { color: Colors.textPrimary, fontSize: 31, fontWeight: '700', letterSpacing: -1 }, subtitle: { color: Colors.textSecondary, fontSize: 12 },
  metrics: { flexDirection: 'row', gap: 9 }, metric: { flex: 1, backgroundColor: '#DBEAF7', padding: 14, borderRadius: 22, gap: 6 }, metricValue: { color: Colors.fordBlue, fontSize: 24, fontWeight: '700' }, metricLabel: { color: Colors.textSecondary, fontSize: 10 }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '600' }, muted: { color: Colors.textSecondary, fontSize: 11 }, search: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 26, paddingHorizontal: 16 }, input: { minWidth: 0, flex: 1, minHeight: 50, color: Colors.textPrimary, fontSize: 13 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, selection: { padding: 16, backgroundColor: Colors.fordBlue, borderRadius: 24 }, selectionText: { color: '#fff', fontSize: 12 },
  card: { borderRadius: 28, backgroundColor: '#254D77', overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' }, selectedCard: { borderColor: '#438ADB' }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }, folderTab: { backgroundColor: '#86B7E4', borderTopRightRadius: 32, paddingHorizontal: 15, paddingVertical: 12 }, folderLabel: { color: '#163B63', fontSize: 10, fontWeight: '600' }, date: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingRight: 12, flexShrink: 1 }, dateText: { fontSize: 9, color: '#D6E8FC' }, cardBody: { backgroundColor: '#86B7E4', borderTopRightRadius: 26, padding: 17, gap: 8 }, cardTitle: { color: '#153554', fontSize: 19, fontWeight: '700' }, version: { color: '#234F78', fontSize: 12 }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, badge: { backgroundColor: '#B2D6F5', color: '#254D77', fontSize: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18 }, cardBottom: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#78A9D5', borderTopWidth: 1, borderTopColor: '#5D92C1', paddingHorizontal: 15 }, cardAction: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 3 }, actionText: { color: '#153554', fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 }, action: { flex: 1, backgroundColor: '#fff', borderRadius: 25, padding: 18, gap: 10 }, actionTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' }, actionDescription: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19 }, tip: { backgroundColor: '#DCEBF7', borderRadius: 25, padding: 20, flexDirection: 'row', gap: 14 },
});
