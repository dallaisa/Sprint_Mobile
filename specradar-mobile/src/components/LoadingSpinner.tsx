import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme/colors';

export function LoadingSpinner({ mensagem = 'Consultando...' }: { mensagem?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.fordBlue} />
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  texto: { fontSize: 14, color: Colors.textSecondary },
});
