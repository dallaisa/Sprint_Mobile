import { Text, StyleSheet } from 'react-native';
import type { ConfiancaCampo, ConfiancaGeral } from '@/src/types/api';
import { Colors } from '@/src/theme/colors';

const LABELS: Record<ConfiancaCampo, string> = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  INFERIDA: 'Inferida',
  NAO_ENCONTRADO: 'Não encontrado',
};

const COLOR: Record<ConfiancaCampo, string> = {
  ALTA: Colors.confidenceAlta,
  MEDIA: Colors.confidenceMedia,
  INFERIDA: Colors.confidenceInferida,
  NAO_ENCONTRADO: Colors.confidenceNaoEncontrado,
};

export const CONFIANCA_GERAL_LABELS: Record<ConfiancaGeral, string> = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  PARCIAL: 'Parcial',
  BAIXA: 'Baixa',
};

export function ConfidenceBadge({ confianca }: { confianca: ConfiancaCampo }) {
  return (
    <Text style={[styles.badge, { color: COLOR[confianca] }]}>
      {LABELS[confianca]}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: { fontSize: 11, fontWeight: '600', marginTop: 4 },
});
