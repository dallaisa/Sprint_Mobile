import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme/colors';

interface Props {
  erro: string;
  onRetry?: () => void;
}

export function ErrorMessage({ erro, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>{erro}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retry}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fdecea', borderRadius: 8, padding: 12, gap: 6 },
  texto: { color: Colors.error, fontSize: 14 },
  retry: { color: Colors.fordBlue, fontWeight: '600', fontSize: 14 },
});
