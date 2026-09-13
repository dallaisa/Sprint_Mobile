import { useState, useCallback, useRef, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { loadHistory } from '@/src/storage/history';
import type { Ficha } from '@/src/types/spec';
import { parseApiDate } from '@/src/api/adapters';
import { listCatalog } from '@/src/api/specs';
import { HOME_GRADIENT } from '@/src/components/screen-background';
import { Colors } from '@/src/theme/colors';
import { EmptyPanel, Pill, ui } from '@/src/components/radar-ui';

type Source = 'mine' | 'catalog';
type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

export default function HistoricoScreen() {
  const [source, setSource] = useState<Source>('mine');
  const [history, setHistory] = useState<Ficha[]>([]);
  const [catalog, setCatalog] = useState<Ficha[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>('idle');
  const [catalogError, setCatalogError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Resumo');
  const [error, setError] = useState('');
  const router = useRouter();
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadHistory().then(items => { if (active) { setHistory(items); setError(''); } }).catch(() => { if (active) setError('Não foi possível carregar as consultas. Abra esta aba novamente para tentar.'); });
    setSelected(null);
    return () => { active = false; };
  }, []));

  // GET /specs/history devolve todas as fichas salvas na API (de todos os usuários). A busca
  // filtra no aparelho: a API só filtra marca e modelo separados, e a tela busca em texto livre.
  const loadCatalog = useCallback(async () => {
    setCatalogStatus('loading');
    setCatalogError('');
    try {
      const items = await listCatalog();
      if (mounted.current) { setCatalog(items); setCatalogStatus('ready'); }
    } catch (failure) {
      if (!mounted.current) return;
      setCatalogError(failure instanceof Error ? failure.message : 'Não foi possível carregar o catálogo.');
      setCatalogStatus('error');
    }
  }, []);
  useFocusEffect(useCallback(() => { if (source === 'catalog') loadCatalog(); }, [source, loadCatalog]));

  const mine = source === 'mine';
  const list = mine ? history : catalog;
  const fields = list.flatMap(item => item.campos);
  const confirmed = fields.filter(field => field.confianca === 'ALTA' && field.valor !== null).length;
  const today = new Date().toLocaleDateString('pt-BR');
  const filtered = list.filter(item => {
    const matches = `${item.marca} ${item.modelo} ${item.versao}`.toLowerCase().includes(search.toLowerCase().trim());
    const complete = item.campos.length > 0 && item.campos.every(field => field.valor !== null && field.confianca !== 'NAO_ENCONTRADO');
    return matches && (filter === 'Resumo' || filter === 'Todas' || (filter === 'Hoje' ? parseApiDate(item.consultado_em)?.toLocaleDateString('pt-BR') === today : complete));
  }).slice(0, filter === 'Resumo' ? 3 : undefined);
  const catalogLoading = !mine && catalogStatus === 'loading';

  function compare(id: string) {
    if (!selected) setSelected(id);
    else if (selected === id) setSelected(null);
    else { router.push({ pathname: '/(tabs)/comparar', params: { v1: selected, v2: id } }); setSelected(null); }
  }
  return <ScrollView style={s.screen} contentContainerStyle={ui.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" refreshControl={mine ? undefined : <RefreshControl refreshing={catalogLoading && catalog.length > 0} onRefresh={loadCatalog} tintColor={Colors.fordBlue} colors={[Colors.fordBlue]} />}>
    <View style={s.hero}><Image source={require('@/assets/historico.jpg')} style={s.heroImage} resizeMode="cover" accessibilityLabel="Pasta azul de histórico" /><View style={s.heroCopy}><Text style={s.eyebrow}>SUA MEMÓRIA AUTOMOTIVA</Text><Text style={s.title}>Histórico.</Text><Text style={s.subtitle}>Cada consulta, um novo ponto de vista.</Text></View></View>
    <View style={s.sources} accessibilityRole="tablist">{([{ key: 'mine', label: 'Minhas consultas' }, { key: 'catalog', label: 'Catálogo SpecRadar' }] as const).map(option => <Pressable key={option.key} accessibilityRole="tab" accessibilityState={{ selected: source === option.key }} onPress={() => setSource(option.key)} style={[s.source, source === option.key && s.sourceActive]}><Text style={[s.sourceText, source === option.key && s.sourceTextActive]}>{option.label}</Text></Pressable>)}</View>
    <View style={s.metrics}>{[{ value: list.length, label: mine ? 'fichas salvas' : 'fichas no banco' }, { value: new Set(list.map(item => `${item.marca} ${item.modelo}`.toLowerCase())).size, label: 'modelos vistos' }, { value: fields.length ? `${Math.round(confirmed / fields.length * 100)}%` : '—', label: 'alta confiança' }].map(metric => <View key={metric.label} style={s.metric}><Text selectable style={s.metricValue}>{metric.value}</Text><Text style={s.metricLabel}>{metric.label}</Text></View>)}</View>
    <View style={[s.heading, { flexWrap: 'wrap', gap: 8 }]}><Text style={s.sectionTitle}>{mine ? 'Suas descobertas' : 'Catálogo SpecRadar'}</Text><Text style={s.muted}>{filter === 'Resumo' ? '3 mais recentes' : mine ? 'Últimos 3 dias' : 'Todas as fichas'}</Text></View>
    <Text style={s.muted}>{mine ? 'Consultas disponíveis por 3 dias. Toque em Todas para ver todas as salvas nesse período.' : 'Fichas salvas na API por qualquer pessoa da equipe, das mais novas para as mais antigas. Puxe para baixo para atualizar.'}</Text>
    <View style={s.search}><MaterialIcons name="search" size={21} color={Colors.fordBlue} /><TextInput style={s.input} accessibilityLabel={mine ? 'Buscar no histórico' : 'Buscar no catálogo'} value={search} onChangeText={setSearch} placeholder="Busque modelo, marca ou versão" placeholderTextColor={Colors.textSecondary} /></View>
    <View style={s.filters}>{['Resumo', 'Todas', 'Hoje', 'Completas'].map(label => <Pill key={label} label={label} selected={label === filter} onPress={() => setFilter(label)} />)}</View>
    {selected && <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.selection}><Text style={s.selectionText}>Escolha a segunda ficha para comparar · Cancelar ×</Text></Pressable>}
    {mine && !!error && <Text accessibilityRole="alert" style={{ color: Colors.error }}>{error}</Text>}
    {catalogLoading && !catalog.length && <View style={s.status}><ActivityIndicator color={Colors.fordBlue} /><Text style={s.muted}>Carregando o catálogo da API…</Text></View>}
    {!mine && catalogStatus === 'error' && <View style={s.status}><Text accessibilityRole="alert" style={s.errorText}>{catalogError}</Text><Pressable accessibilityRole="button" onPress={loadCatalog} style={s.retry}><Text style={s.retryText}>Tentar novamente</Text></Pressable></View>}
    {filtered.map(item => {
      const values = item.campos;
      const available = values.filter(value => value.valor !== null && value.confianca !== 'NAO_ENCONTRADO').length;
      const trusted = values.filter(value => value.confianca === 'ALTA' && value.valor !== null).length;
      const date = parseApiDate(item.consultado_em);
      const percent = values.length ? Math.round(available / values.length * 100) : 0;
      return <View key={item.id} style={[s.card, selected === item.id && s.selectedCard]}>
        <View style={s.cardTop}>
          <View style={s.folderTab}><Text style={s.folderLabel}>{mine ? 'Consulta salva' : 'No catálogo'}</Text></View>
          <View style={s.progress}><View style={s.progressTrack}><View style={[s.progressFill, { width: `${percent}%` }]} /></View><Text style={s.progressLabel}>{percent}%</Text></View>
        </View>
        <View style={s.cardSurface}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${item.marca} ${item.modelo}`} onPress={() => router.push({ pathname: '/ficha/[id]', params: { id: item.id } })} style={s.cardBody}>
            <Text style={s.cardTitle}>{item.marca} {item.modelo}</Text><Text style={s.version}>{item.versao}{date ? ` · ${date.toLocaleDateString('pt-BR')}` : ''}</Text>
          </Pressable>
          <View style={s.cardBottom}><View style={s.cardMeta}><MaterialIcons name="verified" size={18} color="#fff" /><Text style={s.metaText}>{available}/{values.length} atributos · {trusted} verificados</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Comparar ${item.modelo}`} accessibilityState={{ selected: selected === item.id }} onPress={() => compare(item.id)} style={s.compareButton}><MaterialIcons name={selected === item.id ? 'check' : 'add'} size={23} color="#fff" /></Pressable></View>
        </View>
      </View>;
    })}
    {!filtered.length && (mine
      ? <EmptyPanel icon="history" title={history.length ? 'Nenhuma ficha neste filtro' : 'Sua próxima descoberta começa aqui'} description={history.length ? 'Tente outro modelo ou selecione Todas para rever as consultas.' : 'Consulte seu primeiro veículo. As fichas ficam disponíveis para revisar e comparar depois.'} href="/(tabs)/chat" action="Abrir uma consulta" />
      : catalogStatus === 'ready' && <EmptyPanel icon="inventory-2" title={catalog.length ? 'Nenhuma ficha neste filtro' : 'O catálogo ainda está vazio'} description={catalog.length ? 'Tente outro modelo ou selecione Todas.' : 'Quando alguém da equipe consultar um carro, a ficha aparece aqui.'} href="/(tabs)/chat" action="Abrir uma consulta" />)}
    <Text style={s.sectionTitle}>Continue explorando</Text>
    <View style={s.actions}>{[{ title: 'Comparar modelos', description: 'Escolha entre 12 carros e veja os detalhes lado a lado.', icon: 'compare-arrows' as const, href: '/(tabs)/comparar' as const }, { title: 'Uma análise sua', description: 'Escolha desempenho, economia ou espaço para a próxima ficha.', icon: 'tune' as const, href: '/(tabs)/formulario' as const }].map(action => <Pressable accessibilityRole="button" key={action.title} onPress={() => router.push(action.href)} style={s.action}><MaterialIcons name={action.icon} size={26} color={Colors.fordBlue} /><Text style={s.actionTitle}>{action.title}</Text><Text style={s.actionDescription}>{action.description}</Text></Pressable>)}</View>
    <View style={s.tip}><MaterialIcons name="verified" size={24} color={Colors.fordBlue} /><View style={{ flex: 1, gap: 6 }}><Text style={s.actionTitle}>Olhe além dos números</Text><Text style={s.actionDescription}>Abra uma ficha para conferir as fontes, verificar a confiança de cada atributo e exportar os dados em CSV.</Text></View></View>
  </ScrollView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background }, hero: { height: 280, borderRadius: 30, overflow: 'hidden', backgroundColor: '#F4F5FA' }, heroImage: { width: '100%', height: 220, position: 'absolute', top: -20 }, heroCopy: { position: 'absolute', bottom: 0, padding: 22, gap: 6 }, eyebrow: { color: Colors.fordBlue, fontSize: 9, letterSpacing: 1.6 }, title: { color: Colors.textPrimary, fontSize: 31, fontWeight: '700', letterSpacing: -1 }, subtitle: { color: Colors.textSecondary, fontSize: 12 },
  sources: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 26, padding: 5, gap: 5 }, source: { flex: 1, minHeight: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }, sourceActive: { backgroundColor: Colors.fordBlue }, sourceText: { color: Colors.fordBlue, fontSize: 13, fontWeight: '600', textAlign: 'center' }, sourceTextActive: { color: '#fff' },
  status: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }, errorText: { color: Colors.error, fontSize: 13, lineHeight: 19, flexShrink: 1 }, retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#fff' }, retryText: { color: Colors.fordBlue, fontSize: 13, fontWeight: '600' },
  metrics: { flexDirection: 'row', gap: 9 }, metric: { flex: 1, backgroundColor: '#DBEAF7', padding: 14, borderRadius: 22, gap: 6 }, metricValue: { color: Colors.fordBlue, fontSize: 24, fontWeight: '700' }, metricLabel: { color: Colors.textSecondary, fontSize: 10 }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '600' }, muted: { color: Colors.textSecondary, fontSize: 11 }, search: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 26, paddingHorizontal: 16 }, input: { minWidth: 0, flex: 1, minHeight: 50, color: Colors.textPrimary, fontSize: 13 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, selection: { padding: 16, backgroundColor: Colors.fordBlue, borderRadius: 24 }, selectionText: { color: '#fff', fontSize: 12 },
  card: { borderRadius: 26, borderWidth: 2, borderColor: 'transparent' }, selectedCard: { borderColor: Colors.fordBlue },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 }, folderTab: { backgroundColor: '#507EB0', borderTopLeftRadius: 19, borderTopRightRadius: 28, paddingHorizontal: 17, paddingTop: 11, paddingBottom: 13 }, folderLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  progress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, paddingRight: 10 }, progressTrack: { flex: 1, height: 4, backgroundColor: '#D6E3F0', borderRadius: 4, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#507EB0', borderRadius: 4 }, progressLabel: { color: Colors.fordBlue, fontSize: 10, fontWeight: '700' },
  cardSurface: { backgroundColor: '#507EB0', experimental_backgroundImage: HOME_GRADIENT, borderRadius: 23, borderTopLeftRadius: 0, padding: 17, gap: 10 }, cardBody: { gap: 5, minHeight: 48 }, cardTitle: { color: '#fff', fontSize: 21, fontWeight: '700' }, version: { color: '#F1F6FF', fontSize: 12 }, cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, cardMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: '#fff', fontSize: 11, flexShrink: 1 }, compareButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#24476C', alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12 }, action: { flex: 1, backgroundColor: '#fff', borderRadius: 25, padding: 18, gap: 10 }, actionTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' }, actionDescription: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19 }, tip: { backgroundColor: '#DCEBF7', borderRadius: 25, padding: 20, flexDirection: 'row', gap: 14 },
});
