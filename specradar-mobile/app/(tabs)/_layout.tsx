import { Tabs, useRouter } from 'expo-router';
import { Image, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/src/theme/colors';
import { signOut } from '@/src/api/auth';
import { HomeBackground } from '@/src/components/screen-background';

const tabIcons = {
  home: { source: require('@/assets/home.png'), width: 256, height: 256, left: 0, top: 3, w: 256, h: 250 },
  chat: { source: require('@/assets/chat.png'), width: 764, height: 760, left: 86, top: 110, w: 592, h: 557 },
  analise: { source: require('@/assets/analise.png'), width: 736, height: 736, left: 169, top: 218, w: 398, h: 306 },
  historico: { source: require('@/assets/historicofundo.png'), width: 512, height: 512, left: 31, top: 52, w: 449, h: 410 },
  comparar: { source: require('@/assets/comparar.png'), width: 1200, height: 1200, left: 298, top: 301, w: 600, h: 604 },
};

// Normalize the visible artwork, accounting for each PNG's transparent margins.
function TabIcon({ name }: { name: keyof typeof tabIcons }) {
  const icon = tabIcons[name];
  const scale = 28 / Math.max(icon.w, icon.h);
  return <View style={{ width: 32, height: 32, overflow: 'hidden' }}>
    <Image source={icon.source} resizeMode="contain" style={{
      position: 'absolute', width: icon.width * scale, height: icon.height * scale,
      left: (32 - icon.w * scale) / 2 - icon.left * scale,
      top: (32 - icon.h * scale) / 2 - icon.top * scale,
    }} />
  </View>;
}

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutTexto}>Sair</Text>
          </TouchableOpacity>
        ),
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
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'SpecRadar',
          headerBackground: () => <HomeBackground />,
          headerTintColor: '#fff',
          tabBarLabel: 'Início',
          tabBarIcon: () => <TabIcon name="home" />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: Colors.fordBlue,
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: () => <TabIcon name="chat" />,
        }}
      />
      <Tabs.Screen
        name="formulario"
        options={{
          title: 'Análise guiada',
          tabBarLabel: 'Análise',
          tabBarIcon: () => <TabIcon name="analise" />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
          tabBarIcon: () => <TabIcon name="historico" />,
        }}
      />
      <Tabs.Screen
        name="comparar"
        options={{
          headerShown: false,
          title: 'Comparar',
          tabBarLabel: 'Comparar',
          tabBarIcon: () => <TabIcon name="comparar" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 16, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#ffffff90' },
  logoutTexto: { color: '#182E40', fontSize: 14, fontWeight: '600' },
});
