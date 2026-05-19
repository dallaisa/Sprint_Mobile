import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { loadHistory } from '@/src/storage/history';
import { SpecResponse } from '@/src/types/spec';
import { SpecCard } from '@/src/components/SpecCard';
import { Colors } from '@/src/theme/colors';

export default function FichaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [spec, setSpec] = useState<SpecResponse | null>(null);

  useEffect(() => {
    loadHistory().then((h) => {
      setSpec(h.find((s) => s.id === id) ?? null);
    });
  }, [id]);

  return (
    <>
      <Stack.Screen
        options={{ title: spec ? `${spec.marca} ${spec.modelo}` : 'Ficha Técnica' }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        {spec && <SpecCard spec={spec} />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
});
