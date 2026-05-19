import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { loadHistory } from '@/src/storage/history';
import { SpecResponse, SpecField } from '@/src/types/spec';
import { Colors, ATRIBUTOS_PADRAO } from '@/src/theme/colors';
import { ConfidenceBadge } from '@/src/components/ConfidenceBadge';

const MAIOR_MELHOR = new Set([
  'potencia_cv', 'torque_nm', 'capacidade_carga_kg',
  'consumo_cidade', 'consumo_estrada',
]);
const MENOR_MELHOR = new Set(['peso_kg', 'preco_base_brl']);

function extrairNumero(valor: string | number | null): number | null {
  if (valor === null) return null;
  if (typeof valor === 'number') return valor;
  const match = valor.replace(',', '.').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function calcularVencedor(chave: string, f1: SpecField, f2: SpecField): 'v1' | 'v2' | null {
  if (f1.confianca === 'nao_encontrado' || f2.confianca === 'nao_encontrado') return null;
  const n1 = extrairNumero(f1.valor);
  const n2 = extrairNumero(f2.valor);
  if (n1 === null || n2 === null || n1 === n2) return null;
  if (MAIOR_MELHOR.has(chave)) return n1 > n2 ? 'v1' : 'v2';
  if (MENOR_MELHOR.has(chave)) return n1 < n2 ? 'v1' : 'v2';
  return null;
}

export default function CompararScreen() {
  const { v1, v2 } = useLocalSearchParams<{ v1?: string; v2?: string }>();
  const [spec1, setSpec1] = useState<SpecResponse | null>(null);
  const [spec2, setSpec2] = useState<SpecResponse | null>(null);

  useEffect(() => {
    if (!v1 || !v2) return;
    loadHistory().then((h) => {
      setSpec1(h.find((s) => s.id === v1) ?? null);
      setSpec2(h.find((s) => s.id === v2) ?? null);
    });
  }, [v1, v2]);

  if (!v1 || !v2) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioIcone}>⚖️</Text>
        <Text style={styles.vazioTexto}>Nenhuma comparação ativa</Text>
        <Text style={styles.vazioSubtexto}>
          Abra o Histórico e toque em "Comparar" em dois veículos.
        </Text>
      </View>
    );
  }

  if (!spec1 || !spec2) return null;

  const atributos = ATRIBUTOS_PADRAO.filter(
    (a) => a in spec1.atributos && a in spec2.atributos
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Cabeçalho */}
      <View style={styles.headerRow}>
        <View style={styles.colunaChave} />
        <VeiculoHeader spec={spec1} />
        <VeiculoHeader spec={spec2} />
      </View>

      {/* Atributos */}
      {atributos.map((chave) => {
        const f1 = spec1.atributos[chave];
        const f2 = spec2.atributos[chave];
        const venc = calcularVencedor(chave, f1, f2);
        return (
          <View key={chave} style={styles.linha}>
            <Text style={styles.chave}>{chave.replace(/_/g, '\n')}</Text>
            <CelulaAtributo campo={f1} vencendo={venc === 'v1'} />
            <CelulaAtributo campo={f2} vencendo={venc === 'v2'} />
          </View>
        );
      })}
    </ScrollView>
  );
}

function VeiculoHeader({ spec }: { spec: SpecResponse }) {
  return (
    <View style={styles.colunaHeader}>
      <Text style={styles.headerMarca}>{spec.marca}</Text>
      <Text style={styles.headerModelo} numberOfLines={2}>{spec.modelo}</Text>
      <Text style={styles.headerVersao}>{spec.versao}</Text>
    </View>
  );
}

function CelulaAtributo({ campo, vencendo }: { campo: SpecField; vencendo: boolean }) {
  return (
    <View style={[styles.celula, vencendo && styles.celulaVencedora]}>
      <Text style={[styles.celulaValor, campo.confianca === 'nao_encontrado' && styles.valorNull]}>
        {campo.valor !== null ? String(campo.valor) : '—'}
      </Text>
      <ConfidenceBadge confianca={campo.confianca} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 12, gap: 2 },
  vazio: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  vazioIcone: { fontSize: 48 },
  vazioTexto: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  vazioSubtexto: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 2,
  },
  colunaChave: { width: 80 },
  colunaHeader: {
    flex: 1,
    backgroundColor: Colors.fordBlue,
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  headerMarca: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerModelo: { fontSize: 14, color: '#fff', fontWeight: '700' },
  headerVersao: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  linha: {
    flexDirection: 'row',
    gap: 2,
    minHeight: 64,
  },
  chave: {
    width: 80,
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    paddingVertical: 10,
    lineHeight: 14,
  },
  celula: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    justifyContent: 'center',
  },
  celulaVencedora: {
    backgroundColor: Colors.compareWinner,
    borderColor: Colors.success,
  },
  celulaValor: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  valorNull: { color: Colors.textSecondary, fontWeight: '400' },
});
