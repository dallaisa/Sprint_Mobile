import { useState, useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { loadHistory } from '@/src/storage/history';
import type { SpecResponse } from '@/src/types/spec';
import { HOME_GRADIENT } from '@/src/components/screen-background';
import { Colors } from '@/src/theme/colors';
import { EmptyPanel, Pill, ui } from '@/src/components/radar-ui';

export default function HistoricoScreen() {
  const [history, setHistory] = useState<SpecResponse[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Resumo');
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
    return matches && (filter === 'Resumo' || filter === 'Todas' || (filter === 'Hoje' ? new Date(item.consultado_em).toLocaleDateString('pt-BR') === today : complete));
  }).slice(0, filter === 'Resumo' ? 3 : undefined);
  function compare(id: string) {
    if (!selected) setSelected(id);
    else if (selected === id) setSelected(null);
    else { router.push({ pathname: '/(tabs)/comparar', params: { v1: selected, v2: id } }); setSelected(null); }
  }
  return <ScrollView style={s.screen} contentContainerStyle={ui.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
    <View style={s.hero}><Image source={require('@/assets/historico.jpg')} style={s.heroImage} resizeMode="cover" accessibilityLabel="Pasta azul de histórico" /><View style={s.heroCopy}><Text style={s.eyebrow}>SUA MEMÓRIA AUTOMOTIVA</Text><Text style={s.title}>Histórico.</Text><Text style={s.subtitle}>Cada consulta, um novo ponto de vista.</Text></View></View>
    <View style={s.metrics}>{[{ value: history.length, label: 'fichas salvas' }, { value: new Set(history.map(item => `${item.marca} ${item.modelo}`)).size, label: 'modelos vistos' }, { value: fields.length ? `${Math.round(confirmed / fields.length * 100)}%` : '—', label: 'alta confiança' }].map(metric => <View key={metric.label} style={s.metric}><Text selectable style={s.metricValue}>{metric.value}</Text><Text style={s.metricLabel}>{metric.label}</Text></View>)}</View>
    <View style={[s.heading, { flexWrap: 'wrap', gap: 8 }]}><Text style={s.sectionTitle}>Suas descobertas</Text><Text style={s.muted}>{filter === 'Resumo' ? '3 mais recentes' : 'Últimos 3 dias'}</Text></View>
    <Text style={s.muted}>Consultas disponíveis por 3 dias. Toque em Todas para ver todas as salvas nesse período.</Text>
    <View style={s.search}><MaterialIcons name="search" size={21} color={Colors.fordBlue} /><TextInput style={s.input} accessibilityLabel="Buscar no histórico" value={search} onChangeText={setSearch} placeholder="Busque modelo, marca ou versão" placeholderTextColor={Colors.textSecondary} /></View>
    <View style={s.filters}>{['Resumo', 'Todas', 'Hoje', 'Completas'].map(label => <Pill key={label} label={label} selected={label === filter} onPress={() => setFilter(label)} />)}</View>
    {selected && <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.selection}><Text style={s.selectionText}>Escolha a segunda ficha para comparar · Cancelar ×</Text></Pressable>}
    {!!error && <Text accessibilityRole="alert" style={{ color: Colors.error }}>{error}</Text>}
    {filtered.map(item => {
      const values = Object.values(item.atributos);
      const available = values.filter(value => value.valor !== null && value.confianca !== 'nao_encontrado').length;
      const trusted = values.filter(value => value.confianca === 'alta' && value.valor !== null).length;
      const date = new Date(item.consultado_em);
      const percent = values.length ? Math.round(available / values.length * 100) : 0;
      return <View key={item.id} style={[s.card, selected === item.id && s.selectedCard]}>
        <View style={s.cardTop}>
          <View style={s.folderTab}><Text style={s.folderLabel}>Consulta salva</Text></View>
          <View style={s.progress}><View style={s.progressTrack}><View style={[s.progressFill, { width: `${percent}%` }]} /></View><Text style={s.progressLabel}>{percent}%</Text></View>
        </View>
        <View style={s.cardSurface}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${item.marca} ${item.modelo}`} onPress={() => router.push({ pathname: '/ficha/[id]', params: { id: item.id } })} style={s.cardBody}>
            <Text style={s.cardTitle}>{item.marca} {item.modelo}</Text><Text style={s.version}>{item.versao} · {date.toLocaleDateString('pt-BR')}</Text>
          </Pressable>
          <View style={s.cardBottom}><View style={s.cardMeta}><MaterialIcons name="verified" size={18} color="#fff" /><Text style={s.metaText}>{available}/{values.length} atributos · {trusted} verificados</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Comparar ${item.modelo}`} accessibilityState={{ selected: selected === item.id }} onPress={() => compare(item.id)} style={s.compareButton}><MaterialIcons name={selected === item.id ? 'check' : 'add'} size={23} color="#fff" /></Pressable></View>
        </View>
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
  card: { borderRadius: 26, borderWidth: 2, borderColor: 'transparent' }, selectedCard: { borderColor: Colors.fordBlue },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 }, folderTab: { backgroundColor: '#507EB0', borderTopLeftRadius: 19, borderTopRightRadius: 28, paddingHorizontal: 17, paddingTop: 11, paddingBottom: 13 }, folderLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  progress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, paddingRight: 10 }, progressTrack: { flex: 1, height: 4, backgroundColor: '#D6E3F0', borderRadius: 4, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#507EB0', borderRadius: 4 }, progressLabel: { color: Colors.fordBlue, fontSize: 10, fontWeight: '700' },
  cardSurface: { backgroundColor: '#507EB0', experimental_backgroundImage: HOME_GRADIENT, borderRadius: 23, borderTopLeftRadius: 0, padding: 17, gap: 10 }, cardBody: { gap: 5, minHeight: 48 }, cardTitle: { color: '#fff', fontSize: 21, fontWeight: '700' }, version: { color: '#F1F6FF', fontSize: 12 }, cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, cardMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: '#fff', fontSize: 11, flexShrink: 1 }, compareButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#24476C', alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12 }, action: { flex: 1, backgroundColor: '#fff', borderRadius: 25, padding: 18, gap: 10 }, actionTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' }, actionDescription: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19 }, tip: { backgroundColor: '#DCEBF7', borderRadius: 25, padding: 20, flexDirection: 'row', gap: 14 },
});
