import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { EmptyPanel } from '@/src/components/radar-ui';
import { ComparisonPicker } from '@/src/components/comparison-picker';
import { loadHistory } from '@/src/storage/history';
import type { CampoSpec } from '@/src/types/api';
import type { Ficha } from '@/src/types/spec';
import { API_CONFIGURED } from '@/src/api/http';
import { buscarAtributo, rotuloAtributo } from '@/src/data/atributos';
import { HOME_GRADIENT } from '@/src/components/screen-background';

// Grupos com valor numérico comparável; o vencedor vindo da API entra na fase 7.
const groups = [
  { label: 'Desempenho', keys: ['potencia', 'torque', 'aceleracao'] },
  { label: 'Economia', keys: ['preco', 'consumo'] },
];
const detailKeys = ['motor', 'transmissao', 'tracao', 'dimensoes'];
const accents = ['#96B8E6', '#B9DCD9'];
function numeric(field?: CampoSpec): number | null {
  if (!field || field.valor === null || field.confianca === 'NAO_ENCONTRADO') return null;
  let value = field.valor.trim().replace(/R\$|\s/g, '');
  if (value.includes(',')) value = value.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+(?:[^\d]|$)/.test(value)) value = value.replace(/\./g, '');
  const match = value.match(/^[-+]?\d+(?:\.\d+)?/);
  return match && Number.isFinite(Number(match[0])) ? Number(match[0]) : null;
}
function confidence(field?: CampoSpec) {
  return !field || field.valor === null || field.confianca === 'NAO_ENCONTRADO' ? 'Sem dado' : field.confianca === 'ALTA' ? 'Alta confiança' : 'Estimativa';
}
export default function CompararScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(0);
  const [details, setDetails] = useState(false);
  const { v1, v2 } = useLocalSearchParams<{ v1?: string; v2?: string }>();
  const [spec1, setSpec1] = useState<Ficha | null>(null);
  const [spec2, setSpec2] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(!v1 || !v2);

  useEffect(() => {
    if (!v1 || !v2) return;
    setChoosing(false);
    let active = true;
    setLoading(true);
    setSpec1(null);
    setSpec2(null);
    loadHistory().then((h) => {
      if (!active) return;
      setSpec1(h.find((s) => s.id === v1) ?? null);
      setSpec2(h.find((s) => s.id === v2) ?? null);
    }).catch(() => {
      if (active) { setSpec1(null); setSpec2(null); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [v1, v2]);

  if (choosing) {
    return (
      <View style={styles.screen}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}>
        <ComparisonPicker onCompare={(first, second) => { setSpec1(first); setSpec2(second); setLoading(false); setChoosing(false); }} />
      </ScrollView></View>
    );
  }

  if (!spec1 || !spec2) return <View style={styles.screen}><View style={styles.vazio}>
    {loading ? <ActivityIndicator color="#fff" size="large" accessibilityLabel="Carregando comparação" /> : <EmptyPanel icon="search-off" title="Vamos selecionar novamente?" description="Uma das fichas não está mais disponível no histórico. Escolha dois veículos para continuar." href="/(tabs)/historico" action="Abrir histórico" />}
  </View></View>;

  const specs = [spec1, spec2];
  const fields = specs.flatMap(spec => spec.campos);
  const available = fields.filter(field => field.valor !== null && field.confianca !== 'NAO_ENCONTRADO').length;
  const trusted = fields.filter(field => field.valor !== null && field.confianca === 'ALTA').length;
  const coverage = fields.length ? Math.round(available / fields.length * 100) : 0;
  return <View style={styles.screen}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}>
    <View style={styles.top}><Text style={styles.eyebrow}>SEU RADAR / COMPARAÇÃO</Text><Text style={styles.eyebrow}>02 MODELOS</Text></View>
    <Text accessibilityRole="header" style={styles.title}>Sua próxima escolha.</Text>
    <Pressable accessibilityRole="button" onPress={() => setChoosing(true)} style={styles.chooseButton}><Text style={styles.chooseLabel}>← Escolher outros carros</Text></Pressable>
    {!API_CONFIGURED && <Text style={styles.demo}>Demonstração · os dois modelos usam dados de exemplo da Ranger Raptor.</Text>}
    <View style={styles.hero}><Text style={styles.heroEyebrow}>LADO A LADO</Text><Text style={styles.heroTitle}>Menos dúvida.{'\n'}Mais clareza.</Text><Text style={styles.heroDescription}>Explore um assunto por vez e encontre as diferenças.</Text></View>
    <View style={styles.vehicles}>{specs.map((spec, index) => <View key={index} style={[styles.vehicle, { borderTopColor: accents[index] }]}><Text style={[styles.eyebrow, { color: accents[index] }]}>{index + 1 < 10 ? '0' : ''}{index + 1} / {spec.marca}</Text><Text style={styles.model}>{spec.modelo}</Text><Text style={styles.muted}>{spec.versao || 'Versão não informada'}</Text></View>)}</View>
    <View style={styles.tabs}>{groups.map((group, index) => <Pressable key={group.label} accessibilityRole="button" accessibilityState={{ selected: category === index }} onPress={() => setCategory(index)} style={[styles.tab, category === index && styles.activeTab]}><Text style={[styles.tabLabel, category === index && styles.activeTabLabel]}>{group.label}</Text></Pressable>)}</View>
    {groups[category].keys.map(key => <Metric key={key} attribute={key} specs={specs} />)}
    <View style={styles.coverage}><View style={styles.coverageCopy}><Text style={styles.sectionTitle}>Por dentro dos dados</Text><Text style={styles.muted}>{available} de {fields.length} atributos disponíveis</Text><Text style={styles.muted}>{trusted} com alta confiança</Text></View><View style={styles.ring}><Text selectable style={styles.ringNumber}>{coverage}%</Text><Text style={styles.ringLabel}>preenchido</Text></View><View style={styles.coverageTrack}><View style={[styles.coverageFill, { width: `${coverage}%` }]} /></View></View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} style={styles.detailsButton}><Text style={styles.sectionTitle}>Motor, transmissão e tração</Text><Text style={styles.toggle}>{details ? '−' : '+'}</Text></Pressable>
    {details && detailKeys.map(key => <View key={key} style={styles.detailCard}><Text style={styles.sectionTitle}>{rotuloAtributo(key)}</Text>{specs.map((spec, index) => <View key={index} style={styles.detailRow}><Text style={[styles.detailName, { color: accents[index] }]}>{spec.modelo}</Text><Text selectable style={styles.detailValue}>{spec.atributos[key]?.valor ?? 'Não informado'}</Text><Text style={styles.muted}>{confidence(spec.atributos[key])}</Text></View>)}</View>)}
  </ScrollView></View>;
}
function Metric({ attribute, specs }: { attribute: string; specs: Ficha[] }) {
  const values = specs.map(spec => numeric(spec.atributos[attribute]));
  const maximum = Math.max(...values.map(value => Math.max(0, value ?? 0)), 1);
  const label = rotuloAtributo(attribute);
  const unit = buscarAtributo(attribute)?.unidade ?? '';
  const difference = values[0] !== null && values[1] !== null ? Math.abs(values[0] - values[1]) : null;
  return <View style={styles.metric}><View style={styles.metricHeading}><Text style={styles.sectionTitle}>{label}</Text><Text style={styles.muted}>{unit}</Text></View>
    <View style={styles.numbers}>{specs.map((spec, index) => <View key={index} style={[styles.numberCard, { backgroundColor: accents[index] }]}><Text style={styles.numberName}>{spec.modelo}</Text><Text selectable adjustsFontSizeToFit numberOfLines={1} style={styles.bigNumber}>{values[index] === null ? '—' : values[index]!.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</Text><Text style={styles.numberConfidence}>{confidence(spec.atributos[attribute])}</Text></View>)}</View>
    <View style={styles.chart}>{specs.map((spec, index) => <View key={index} style={styles.barRow}><Text style={[styles.barId, { color: accents[index] }]}>0{index + 1}</Text><View style={styles.track}><View style={[styles.bar, { width: `${Math.max(0, values[index] ?? 0) / maximum * 100}%`, backgroundColor: accents[index] }]} /></View></View>)}</View>
    <Text style={styles.insight}>{difference === null ? 'Dados insuficientes para calcular a diferença.' : difference === 0 ? 'Mesmo valor nas duas fichas.' : `Diferença de ${difference.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unit} entre os modelos.`}</Text>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#151E27' }, scroll: { padding: 18, paddingBottom: 32, gap: 18, width: '100%', maxWidth: 680, alignSelf: 'center' }, vazio: { flex: 1, justifyContent: 'center', padding: 24 },
  top: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }, eyebrow: { color: '#A8BACB', fontSize: 10, letterSpacing: 1.3 }, title: { fontSize: 30, fontWeight: '600', color: '#F4F7FC', letterSpacing: -0.8 }, chooseButton: { alignSelf: 'flex-start', paddingHorizontal: 17, paddingVertical: 13, borderRadius: 24, backgroundColor: '#253442' }, chooseLabel: { color: '#E1EDFA', fontSize: 13, fontWeight: '600' }, demo: { color: '#BDCDE0', fontSize: 11, lineHeight: 17 },
  hero: { backgroundColor: '#507EB0', experimental_backgroundImage: HOME_GRADIENT, borderRadius: 28, padding: 23, gap: 10 }, heroEyebrow: { color: '#F3F7FC', fontSize: 10, letterSpacing: 2 }, heroTitle: { color: '#fff', fontSize: 32, lineHeight: 36, fontWeight: '700', letterSpacing: -1 }, heroDescription: { color: '#fff', fontSize: 13, lineHeight: 20 },
  vehicles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, vehicle: { flex: 1, minWidth: 120, backgroundColor: '#202D39', borderRadius: 21, borderTopWidth: 3, padding: 16, gap: 6 }, model: { color: '#fff', fontSize: 20, fontWeight: '600' }, muted: { color: '#AFBECC', fontSize: 11, lineHeight: 17 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#202D39', borderRadius: 25, padding: 5, gap: 5 }, tab: { flexGrow: 1, paddingHorizontal: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 }, activeTab: { backgroundColor: '#F0F5FB' }, tabLabel: { color: '#B9C9D9', fontSize: 12, fontWeight: '600' }, activeTabLabel: { color: '#203344' },
  metric: { gap: 13, padding: 16, backgroundColor: '#1D2934', borderRadius: 26 }, metricHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F1F6FB', flexShrink: 1 }, numbers: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, numberCard: { flex: 1, minWidth: 108, padding: 14, borderRadius: 21, gap: 8 }, numberName: { color: '#203648', fontSize: 12, fontWeight: '600' }, bigNumber: { color: '#152D40', fontSize: 38, fontWeight: '700', letterSpacing: -1, fontVariant: ['tabular-nums'] }, numberConfidence: { color: '#29495D', fontSize: 10 }, chart: { gap: 9, paddingTop: 3 }, barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, barId: { fontSize: 10, fontWeight: '700' }, track: { flex: 1, height: 9, backgroundColor: '#344350', borderRadius: 8, overflow: 'hidden' }, bar: { height: '100%', borderRadius: 8 }, insight: { color: '#BCCBD8', fontSize: 12, lineHeight: 18 },
  coverage: { padding: 20, borderRadius: 26, backgroundColor: '#0E161E', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }, coverageCopy: { flex: 1, minWidth: 140, gap: 8 }, ring: { width: 100, height: 100, borderRadius: 50, borderWidth: 7, borderColor: '#96B8E6', alignItems: 'center', justifyContent: 'center' }, ringNumber: { color: '#fff', fontSize: 23, fontWeight: '700', fontVariant: ['tabular-nums'] }, ringLabel: { color: '#AEBECE', fontSize: 9 }, coverageTrack: { width: '100%', height: 6, borderRadius: 5, backgroundColor: '#344350', overflow: 'hidden' }, coverageFill: { height: '100%', backgroundColor: '#96B8E6' }, detailsButton: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 8 }, toggle: { color: '#96B8E6', fontSize: 25 }, detailCard: { padding: 20, borderRadius: 24, backgroundColor: '#202D39', gap: 15 }, detailRow: { gap: 5 }, detailName: { fontSize: 12, fontWeight: '600' }, detailValue: { color: '#fff', fontSize: 14, lineHeight: 21 },
});
