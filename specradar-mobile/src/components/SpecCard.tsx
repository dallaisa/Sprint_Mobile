import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { SpecResponse } from '@/src/types/spec';
import { Colors } from '@/src/theme/colors';
import { ConfidenceBadge } from './ConfidenceBadge';

interface Props {
  spec: SpecResponse;
  atributosFiltro?: string[];
}

export function SpecCard({ spec, atributosFiltro }: Props) {
  const entradas = Object.entries(spec.atributos).filter(
    ([chave]) => !atributosFiltro || atributosFiltro.includes(chave)
  );

  async function exportarCSV() {
    const linhas = [
      'atributo,valor,confianca,fonte,verificado_em',
      ...entradas.map(([chave, campo]) =>
        [chave, campo.valor !== null ? String(campo.valor) : '', campo.confianca, campo.fonte ?? '', campo.verificado_em ?? '']
          .map((c) => `"${c.replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];
    const csv = `${spec.marca} ${spec.modelo} — ${spec.versao}\n${linhas.join('\n')}`;
    await Share.share({ message: csv, title: `${spec.marca}_${spec.modelo}.csv` });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>{spec.marca} {spec.modelo}</Text>
          <Text style={styles.versao}>{spec.versao}</Text>
        </View>
        <TouchableOpacity style={styles.botaoCSV} onPress={exportarCSV}>
          <Text style={styles.botaoCSVTexto}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>

      {entradas.map(([chave, campo]) => (
        <View key={chave} style={styles.campo}>
          <Text style={styles.campoChave}>{chave.replace(/_/g, ' ')}</Text>
          <Text style={[styles.campoValor, campo.confianca === 'nao_encontrado' && styles.valorNull]}>
            {campo.valor !== null ? String(campo.valor) : '—'}
          </Text>
          <ConfidenceBadge confianca={campo.confianca} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  headerTexto: { flex: 1, marginRight: 12 },
  titulo: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  versao: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  botaoCSV: {
    backgroundColor: Colors.fordBlue,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  botaoCSVTexto: { color: '#fff', fontWeight: '600', fontSize: 13 },
  campo: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  campoChave: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase' },
  campoValor: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500', marginTop: 2 },
  valorNull: { color: Colors.textSecondary },
});
