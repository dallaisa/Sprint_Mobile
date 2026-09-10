import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { AppHeader } from '@/src/components/AppHeader';
import { RegistrationFrame } from '@/src/components/RegistrationFrame';
import { Palette, Fonts, Radius, Space } from '@/src/theme/theme';
import { ATRIBUTOS_PADRAO } from '@/src/theme/colors';
import { clearToken } from '@/src/storage/auth';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

const actions: { title: string; description: string; icon: IconName; href: Href }[] = [
  { title: 'Consultar ficha', description: 'Busca por conversa rápida', icon: 'search', href: '/(tabs)/chat' },
  { title: 'Análise guiada', description: 'Marca, modelo, atributos', icon: 'tune', href: '/(tabs)/formulario' },
  { title: 'Histórico', description: 'Últimas 10 consultas', icon: 'history', href: '/(tabs)/historico' },
  { title: 'Comparar', description: 'Radar de dois veículos', icon: 'compare-arrows', href: '/(tabs)/comparar' },
];

const metrics = [
  { value: String(ATRIBUTOS_PADRAO.length), caption: 'atributos padrão', invert: false },
  { value: '<10s', caption: 'por consulta', invert: true },
  { value: '360°', caption: 'comparação', invert: false },
];

export default function HomeScreen() {
  const router = useRouter();

  function openProfile() {
    Alert.alert('Perfil', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          router.replace('/login');
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <AppHeader onAccountPress={openProfile} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero — duotone spec plate with registration marks */}
        <RegistrationFrame style={styles.heroWrap}>
          <View style={styles.hero}>
            <Image
              source={require('@/assets/home/ranger.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
              accessibilityLabel="Ford Ranger Raptor"
            />
            <View pointerEvents="none" style={styles.heroDuotone} />
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>CASO DE TESTE · RANGER RAPTOR</Text>
              <Text style={styles.heroTitle}>Decisões automotivas com dados verificáveis.</Text>
            </View>
          </View>
        </RegistrationFrame>

        {/* Metrics row */}
        <View style={styles.metrics}>
          {metrics.map((m) => (
            <View key={m.caption} style={[styles.metric, m.invert && styles.metricInvert]}>
              <Text style={[styles.metricValue, m.invert && styles.onNavy]}>{m.value}</Text>
              <Text style={[styles.metricCaption, m.invert && styles.onNavyMuted]}>{m.caption}</Text>
            </View>
          ))}
        </View>

        {/* Ações rápidas */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>
          <Text style={styles.sectionCount}>{String(actions.length).padStart(2, '0')}</Text>
        </View>

        {/* Blueprint grid: the container's gridLine background shows through the
            1px gaps, forming the divider rules — no per-cell borders, no radius. */}
        <View style={styles.grid}>
          {actions.map((action) => (
            <Link key={action.title} href={action.href} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={action.title}
                android_ripple={{ color: '#d6ebff' }}
                style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
              >
                <MaterialIcons name={action.icon} size={20} color={Palette.blue} />
                <View style={styles.cellText}>
                  <Text style={styles.cellTitle}>{action.title}</Text>
                  <Text style={styles.cellDescription}>{action.description}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.ground },
  content: { padding: Space.md, paddingBottom: Space.xl, gap: Space.md },

  // Hero
  heroWrap: { marginTop: Space.xs },
  hero: {
    height: 190,
    backgroundColor: Palette.navy,
    borderRadius: Radius.none,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroDuotone: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4, 30, 66, 0.58)' },
  heroCopy: { padding: Space.md, gap: 6 },
  heroEyebrow: {
    fontFamily: Fonts.label,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Palette.onNavyEyebrow,
  },
  heroTitle: {
    fontFamily: Fonts.titleXBold,
    fontSize: 27,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: Palette.onNavy,
    maxWidth: 260,
  },

  // Metrics
  metrics: { flexDirection: 'row', gap: Space.xs },
  metric: {
    flex: 1,
    minHeight: 100,
    paddingVertical: Space.md,
    paddingHorizontal: Space.sm,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.hairline,
    borderRadius: Radius.none,
    justifyContent: 'center',
    gap: 5,
  },
  metricInvert: { backgroundColor: Palette.navy, borderColor: Palette.navy },
  metricValue: { fontFamily: Fonts.titleXBold, fontSize: 36, lineHeight: 38, color: Palette.navy },
  metricCaption: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 17, color: Palette.inkMuted },
  onNavy: { color: Palette.onNavy },
  onNavyMuted: { color: Palette.onNavyMuted },

  // Section header
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.xs,
  },
  sectionTitle: { fontFamily: Fonts.title, fontSize: 15, letterSpacing: 0.5, color: Palette.navy },
  sectionCount: { fontFamily: Fonts.body, fontSize: 10, color: Palette.inkFaint },

  // Actions grid — 2×2 blueprint, dividers formed by the container bg in the gaps
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    borderWidth: 1,
    borderColor: Palette.gridLine,
    backgroundColor: Palette.gridLine,
  },
  cell: {
    flex: 1,
    minWidth: '48%',
    minHeight: 104,
    padding: 13,
    gap: 6,
    backgroundColor: Palette.surface,
    borderRadius: Radius.none,
    justifyContent: 'flex-start',
  },
  cellPressed: { backgroundColor: '#eef6ff' },
  cellText: { gap: 3 },
  cellTitle: {
    fontFamily: Fonts.label,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Palette.navy,
  },
  cellDescription: { fontFamily: Fonts.body, fontSize: 11, lineHeight: 15, color: Palette.inkMuted },
});
