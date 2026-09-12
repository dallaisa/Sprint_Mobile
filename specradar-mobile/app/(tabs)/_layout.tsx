import { Tabs, useRouter } from 'expo-router';
<<<<<<< Updated upstream
import { Platform, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Palette, Fonts } from '@/src/theme/theme';
=======
import { Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/src/theme/colors';
>>>>>>> Stashed changes
import { IconSymbol } from '@/components/ui/icon-symbol';
import { clearToken } from '@/src/storage/auth';
import { HomeBackground } from '@/src/components/screen-background';

type SFName = Parameters<typeof IconSymbol>[0]['name'];

/** Icon slot with the active top-tick — reserved even when inactive to avoid jitter. */
function TabIcon({ name, color, focused, size }: { name: SFName; color: string; focused: boolean; size: number }) {
  return (
    <View style={styles.iconSlot}>
      <View style={[styles.tick, focused && styles.tickActive]} />
      <IconSymbol name={name} size={size} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function handleLogout() {
    await clearToken();
    router.replace('/login');
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        // Interim header for tabs not yet redesigned; home hides it and uses AppHeader.
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutTexto}>Sair</Text>
          </TouchableOpacity>
        ),
<<<<<<< Updated upstream
        headerStyle: { backgroundColor: Palette.navy },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: Fonts.title, letterSpacing: 0.5 },
        tabBarActiveTintColor: Palette.navy,
        tabBarInactiveTintColor: Palette.inkMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: { paddingTop: 4 },
        tabBarStyle: {
          backgroundColor: Palette.surface,
          borderTopColor: Palette.hairline,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 86 : 64,
        },
=======
        tabBarActiveTintColor: Colors.fordBlue,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          borderRadius: 30,
          marginHorizontal: 10,
          marginBottom: Math.max(insets.bottom, 8),
          boxShadow: '0 4px 18px rgba(22, 54, 90, 0.14)',
          paddingTop: 10,
          paddingBottom: 10,
          height: 74,
        },
        headerStyle: { backgroundColor: Colors.background },
        headerShadowVisible: false,
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
>>>>>>> Stashed changes
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
<<<<<<< Updated upstream
          headerShown: false,
=======
          title: 'SpecRadar',
          headerBackground: () => <HomeBackground />,
          headerTintColor: '#fff',
>>>>>>> Stashed changes
          tabBarLabel: 'Início',
          tabBarIcon: (p) => <TabIcon name="house.fill" {...p} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
<<<<<<< Updated upstream
          title: 'Consultar',
          tabBarLabel: 'Consultar',
          tabBarIcon: (p) => <TabIcon name="message.fill" {...p} />,
=======
          headerBackground: () => <HomeBackground />,
          headerTintColor: '#fff',
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Image source={require('@/assets/chat.png')} style={{ width: size + 6, height: size + 6 }} resizeMode="contain" />
          ),
>>>>>>> Stashed changes
        }}
      />
      <Tabs.Screen
        name="formulario"
        options={{
<<<<<<< Updated upstream
          title: 'Formulário',
          tabBarLabel: 'Formulário',
          tabBarIcon: (p) => <TabIcon name="doc.text.fill" {...p} />,
=======
          title: 'Análise guiada',
          tabBarLabel: 'Análise',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="doc.text.fill" size={size} color={color} />
          ),
>>>>>>> Stashed changes
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
<<<<<<< Updated upstream
          tabBarIcon: (p) => <TabIcon name="clock.fill" {...p} />,
=======
          tabBarIcon: ({ color, size }) => (
            <Image source={require('@/assets/historicofundo.png')} style={{ width: size + 4, height: size + 4 }} resizeMode="contain" />
          ),
>>>>>>> Stashed changes
        }}
      />
      <Tabs.Screen
        name="comparar"
        options={{
          headerShown: false,
          title: 'Comparar',
          tabBarLabel: 'Comparar',
<<<<<<< Updated upstream
          tabBarIcon: (p) => <TabIcon name="chart.bar.fill" {...p} />,
=======
          tabBarIcon: ({ color, size }) => (
            <Image source={require('@/assets/comparar.png')} style={{ width: size + 10, height: size + 10 }} resizeMode="contain" />
          ),
>>>>>>> Stashed changes
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  logoutBtn: { marginRight: 16, paddingVertical: 4, paddingHorizontal: 8 },
  logoutTexto: { color: '#fff', fontSize: 14, fontFamily: Fonts.bodySemibold },
  tabLabel: { fontFamily: Fonts.label, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  iconSlot: { alignItems: 'center', justifyContent: 'flex-start' },
  tick: { height: 2, width: 22, marginBottom: 6, backgroundColor: 'transparent' },
  tickActive: { backgroundColor: Palette.navy },
=======
  logoutBtn: { marginRight: 16, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#ffffff90' },
  logoutTexto: { color: '#182E40', fontSize: 14, fontWeight: '600' },
>>>>>>> Stashed changes
});
