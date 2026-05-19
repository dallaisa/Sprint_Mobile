import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ficha/[id]" options={{ headerShown: true, title: 'Ficha Técnica' }} />
    </Stack>
  );
}
