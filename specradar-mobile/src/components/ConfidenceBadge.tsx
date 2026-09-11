import { Text, StyleSheet } from 'react-native';
import { Confidence } from '@/src/types/spec';
import { Colors } from '@/src/theme/colors';

const LABELS: Record<Confidence, string> = {
  alta: 'Alta',
  media: 'Média',
  inferida: 'Inferida',
  nao_encontrado: 'Não encontrado',
};

const COLOR: Record<Confidence, string> = {
  alta: Colors.confidenceAlta,
  media: Colors.confidenceMedia,
  inferida: Colors.confidenceInferida,
  nao_encontrado: Colors.confidenceNaoEncontrado,
};

/** Confiança de UM campo da ficha. */
export function ConfidenceBadge({ confianca }: { confianca: Confidence }) {
  return (
    <Text style={[styles.badge, { color: COLOR[confianca] }]}>
      {LABELS[confianca]}
    </Text>
  );
}

/**
 * Confiança GERAL da ficha (`confidence_geral`) — domínio diferente do
 * de campo: aqui existem PARCIAL e BAIXA, e não existe NAO_ENCONTRADO.
 * Por isso não reaproveita os mapas acima; casá-los na marra faria
 * PARCIAL cair em undefined e sumir da tela sem erro.
 *
 * O valor chega em maiúsculas e sem normalização — o adapter normaliza a
 * confiança de campo, mas `confidence_geral` é repassado cru, e uma ficha
 * salva no histórico antes da Fase 2 nem tem o campo.
 */
const LABELS_GERAL: Record<string, string> = {
  ALTA: 'Confiança alta',
  MEDIA: 'Confiança média',
  PARCIAL: 'Confiança parcial',
  BAIXA: 'Confiança baixa',
};

const COLOR_GERAL: Record<string, string> = {
  ALTA: Colors.confidenceAlta,
  MEDIA: Colors.confidenceMedia,
  PARCIAL: Colors.confidenceInferida,
  BAIXA: Colors.confidenceNaoEncontrado,
};

export function ConfidenceGeralBadge({ confianca }: { confianca?: string }) {
  if (!confianca) return null;

  const chave = confianca.trim().toUpperCase();
  const rotulo = LABELS_GERAL[chave];
  if (!rotulo) return null;

  return (
    <Text style={[styles.badgeGeral, { color: COLOR_GERAL[chave] }]}>
      {rotulo}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  badgeGeral: { fontSize: 12, fontWeight: '700', marginTop: 4 },
});
