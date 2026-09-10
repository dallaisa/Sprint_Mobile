import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

const navy = '#041E42';
const blue = '#003087';
type IconName = ComponentProps<typeof MaterialIcons>['name'];

const actions: { title: string; description: string; icon: IconName; href: Href }[] = [
  { title: 'Consultar ficha', description: 'Busque dados técnicos por conversa rápida.', icon: 'search', href: '/(tabs)/chat' },
  { title: 'Análise guiada', description: 'Preencha marca, modelo, versão e atributos.', icon: 'tune', href: '/(tabs)/formulario' },
  { title: 'Histórico', description: 'Veja consultas salvas e selecione comparações.', icon: 'history', href: '/(tabs)/historico' },
  { title: 'Comparar', description: 'Analise pontos fortes entre dois veículos.', icon: 'compare-arrows', href: '/(tabs)/comparar' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.hero}>
        <Image source={require('@/assets/home/ranger.jpg')} style={styles.heroImage} resizeMode="cover" accessibilityLabel="Ford Ranger Black" />
        <View pointerEvents="none" style={styles.heroShade} />
        <View style={styles.heroTop}>
          <View style={styles.brand}>
            <MaterialIcons name="directions-car" size={15} color="#fff" />
            <Text style={styles.brandText}>Ford Intelligence</Text>
          </View>
          <Link href="/(tabs)/comparar" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir comparação de veículos" style={({ pressed }) => [styles.heroIcon, pressed && styles.pressed]}>
              <MaterialIcons name="auto-graph" size={22} color="#fff" />
            </Pressable>
          </Link>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>SPECRADAR MOBILE</Text>
          <Text style={styles.heroTitle}>Decisões automotivas com dados em tempo real.</Text>
          <Text style={styles.heroDescription}>Consulte, compare e organize fichas técnicas para apoiar inteligência competitiva da Ford.</Text>
          <Link href="/(tabs)/formulario" asChild>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryLabel}>Começar análise</Text>
              <MaterialIcons name="arrow-forward" size={20} color={navy} />
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={styles.metricTitle}>API</Text><Text style={styles.metricCaption}>dados externos</Text></View>
        <View style={[styles.metric, styles.metricDark]}><Text style={[styles.metricTitle, styles.white]}>IA</Text><Text style={[styles.metricCaption, styles.light]}>respostas úteis</Text></View>
        <View style={styles.metric}><Text style={styles.metricTitle}>360°</Text><Text style={styles.metricCaption}>comparação</Text></View>
      </View>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Ações rápidas</Text>
      <View style={styles.grid}>
        {[actions.slice(0, 2), actions.slice(2, 4)].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.actionRow}>
            {row.map((action) => (
              <View key={action.title} style={styles.action}>
                <Link href={action.href} asChild>
                  <Pressable accessibilityRole="button" accessibilityLabel={action.title} style={styles.actionContent} android_ripple={{ color: '#EAF4FF' }}>
                    <View style={styles.actionIcon}><MaterialIcons name={action.icon} size={22} color={blue} /></View>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.featured}>
        <View style={styles.featuredCopy}>
          <Text style={styles.featuredEyebrow}>MODELO EM DESTAQUE</Text>
          <Text accessibilityRole="header" style={styles.featuredTitle}>Bronco Sport</Text>
          <Text style={styles.featuredDescription}>Visual robusto, perfil aventureiro e leitura rápida para apresentação de produto.</Text>
          <Link href={{ pathname: '/(tabs)/formulario', params: { marca: 'Ford', modelo: 'Bronco Sport' } }} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Consultar versão do Ford Bronco Sport" style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
              <Text style={styles.outlineLabel}>Consultar versão</Text>
            </Pressable>
          </Link>
        </View>
        <Image source={require('@/assets/home/bronco-sport.jpg')} style={styles.featuredImage} resizeMode="contain" accessibilityLabel="Ford Bronco Sport branco" />
      </View>

      <View style={styles.radar}>
        <View style={styles.radarHeading}>
          <Text accessibilityRole="header" style={styles.radarTitle}>Radar competitivo</Text>
          <MaterialIcons name="auto-graph" size={25} color="#8BBFFF" />
        </View>
        <Text style={styles.radarDescription}>Transforme atributos como potência, torque, consumo, preço e carga em uma visão simples para comparar concorrentes e defender oportunidades.</Text>
        <Link href="/(tabs)/comparar" asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.radarButton, pressed && styles.pressed]}>
            <Text style={styles.radarButtonLabel}>Comparar veículos</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EFF5FC' },
  content: { padding: 16, paddingBottom: 28, gap: 16, width: '100%', maxWidth: 620, alignSelf: 'center' },
  hero: { minHeight: 450, borderRadius: 32, overflow: 'hidden', backgroundColor: navy, justifyContent: 'space-between' },
  heroImage: { position: 'absolute', top: 0, bottom: 0, right: -190, width: 1300, height: '100%' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 18, 38, 0.58)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 24, borderWidth: 1, borderColor: '#ffffff40', backgroundColor: '#ffffff26' },
  brandText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroIcon: { width: 42, height: 42, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff26', borderWidth: 1, borderColor: '#ffffff40' },
  heroCopy: { padding: 22, paddingTop: 24, gap: 12 },
  eyebrow: { color: '#9ED6FF', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { color: '#fff', fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -0.6 },
  heroDescription: { color: '#E0E7F1', fontSize: 14, lineHeight: 20 },
  primaryButton: { flexDirection: 'row', gap: 12, alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 28, paddingHorizontal: 19, minHeight: 48, marginTop: 8 },
  primaryLabel: { color: navy, fontSize: 14, fontWeight: '700' },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { flex: 1, borderRadius: 23, padding: 13, gap: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', minHeight: 74 },
  metricDark: { backgroundColor: navy, borderColor: navy },
  metricTitle: { color: blue, fontSize: 21, fontWeight: '800' },
  metricCaption: { color: '#465363', fontSize: 11 },
  white: { color: '#fff' },
  light: { color: '#CFDFF4' },
  sectionTitle: { color: navy, fontSize: 22, fontWeight: '800', marginTop: 4 },
  grid: { gap: 12 },
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  action: { flex: 1, minWidth: 0, backgroundColor: '#fff', borderRadius: 26, borderWidth: 1, borderColor: '#DFE7F0', overflow: 'hidden', boxShadow: '0 2px 3px rgba(4, 30, 66, 0.12)' },
  actionContent: { flex: 1, minHeight: 148, padding: 14, gap: 8, alignItems: 'flex-start' },
  actionIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#EAF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  actionTitle: { color: navy, fontSize: 14, fontWeight: '700' },
  actionDescription: { color: '#7A8490', fontSize: 12, lineHeight: 17 },
  featured: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 30, borderWidth: 1, borderColor: '#DFE7F0', padding: 18, paddingVertical: 26 },
  featuredCopy: { flex: 1.35, gap: 10 },
  featuredEyebrow: { color: '#30568A', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  featuredTitle: { color: navy, fontSize: 23, fontWeight: '800', letterSpacing: -0.5 },
  featuredDescription: { color: '#7A8490', fontSize: 13, lineHeight: 19 },
  featuredImage: { flex: 1, height: 120 },
  outlineButton: { alignSelf: 'flex-start', borderWidth: 1.2, borderColor: blue, borderRadius: 24, minHeight: 42, justifyContent: 'center', paddingHorizontal: 14, marginTop: 5 },
  outlineLabel: { color: blue, fontSize: 12, fontWeight: '700' },
  radar: { borderRadius: 30, backgroundColor: navy, padding: 20, gap: 10 },
  radarHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  radarTitle: { color: '#fff', fontSize: 23, fontWeight: '800', flexShrink: 1 },
  radarDescription: { color: '#CADCF3', fontSize: 13, lineHeight: 19 },
  radarButton: { flexDirection: 'row', gap: 12, alignItems: 'center', alignSelf: 'flex-start', minHeight: 44, marginTop: 4 },
  radarButtonLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
