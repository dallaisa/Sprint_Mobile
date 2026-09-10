import { Tabs, useRouter } from 'expo-router';
import { Platform, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Palette, Fonts } from '@/src/theme/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { clearToken } from '@/src/storage/auth';

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
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: 'Início',
          tabBarIcon: (p) => <TabIcon name="house.fill" {...p} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Consultar',
          tabBarLabel: 'Consultar',
          tabBarIcon: (p) => <TabIcon name="message.fill" {...p} />,
        }}
      />
      <Tabs.Screen
        name="formulario"
        options={{
          title: 'Formulário',
          tabBarLabel: 'Formulário',
          tabBarIcon: (p) => <TabIcon name="doc.text.fill" {...p} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
          tabBarIcon: (p) => <TabIcon name="clock.fill" {...p} />,
        }}
      />
      <Tabs.Screen
        name="comparar"
        options={{
          title: 'Comparar',
          tabBarLabel: 'Comparar',
          tabBarIcon: (p) => <TabIcon name="chart.bar.fill" {...p} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 16, paddingVertical: 4, paddingHorizontal: 8 },
  logoutTexto: { color: '#fff', fontSize: 14, fontFamily: Fonts.bodySemibold },
  tabLabel: { fontFamily: Fonts.label, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  iconSlot: { alignItems: 'center', justifyContent: 'flex-start' },
  tick: { height: 2, width: 22, marginBottom: 6, backgroundColor: 'transparent' },
  tickActive: { backgroundColor: Palette.navy },
});
