import { Tabs, useRouter } from 'expo-router';
import { Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { clearToken } from '@/src/storage/auth';

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
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutTexto}>Sair</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: Colors.fordBlue,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 84 : 60,
        },
        headerStyle: { backgroundColor: Colors.fordBlue },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="house.fill" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="message.fill" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="formulario"
        options={{
          title: 'Formulário',
          tabBarLabel: 'Formulário',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="doc.text.fill" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="clock.fill" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="comparar"
        options={{
          title: 'Comparar',
          tabBarLabel: 'Comparar',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="chart.bar.fill" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 16, paddingVertical: 4, paddingHorizontal: 8 },
  logoutTexto: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
