import { Text, StyleSheet } from 'react-native';
import { Confidence } from '@/src/types/spec';
import { Colors } from '@/src/theme/colors';

const LABELS: Record<Confidence, string> = {
  alta: 'Alta',
  inferida: 'Inferida',
  nao_encontrado: 'Não encontrado',
};

const COLOR: Record<Confidence, string> = {
  alta: Colors.confidenceAlta,
  inferida: Colors.confidenceInferida,
  nao_encontrado: Colors.confidenceNaoEncontrado,
};

export function ConfidenceBadge({ confianca }: { confianca: Confidence }) {
  return (
    <Text style={[styles.badge, { color: COLOR[confianca] }]}>
      {LABELS[confianca]}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: { fontSize: 11, fontWeight: '600', marginTop: 4 },
});
