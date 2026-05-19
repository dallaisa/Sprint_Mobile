import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="chat"
      screenOptions={{
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
