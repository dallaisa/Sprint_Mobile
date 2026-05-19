import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { loadHistory } from '@/src/storage/history';
import { SpecResponse } from '@/src/types/spec';
import { Colors } from '@/src/theme/colors';

export default function HistoricoScreen() {
  const [historico, setHistorico] = useState<SpecResponse[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistorico);
      setSelecionado(null);
    }, [])
  );

  function handleComparar(id: string) {
    if (selecionado === null) {
      setSelecionado(id);
    } else if (selecionado === id) {
      setSelecionado(null);
    } else {
      router.push({ pathname: '/(tabs)/comparar', params: { v1: selecionado, v2: id } });
    }
  }

  if (historico.length === 0) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioIcone}>📋</Text>
        <Text style={styles.vazioTexto}>Nenhuma consulta ainda</Text>
        <Text style={styles.vazioSubtexto}>Faça uma consulta nas abas Chat ou Formulário.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selecionado && (
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>Selecione outro veículo para comparar</Text>
          <TouchableOpacity onPress={() => setSelecionado(null)}>
            <Text style={styles.avisoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const marcado = item.id === selecionado;
          const data = new Date(item.consultado_em).toLocaleDateString('pt-BR');
          return (
            <View style={[styles.card, marcado && styles.cardMarcado]}>
              <TouchableOpacity
                style={styles.cardInfo}
                onPress={() =>
                  router.push({ pathname: '/ficha/[id]', params: { id: item.id } })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitulo}>
                  {item.marca} {item.modelo}
                </Text>
                <Text style={styles.cardSub}>
                  {item.versao} · {data}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoComparar, marcado && styles.botaoComparaMarcado]}
                onPress={() => handleComparar(item.id)}
              >
                <Text style={[styles.botaoCompararTexto, marcado && styles.botaoCompararTextoMarcado]}>
                  {marcado ? '✓ 1º' : 'Comparar'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  aviso: {
    backgroundColor: Colors.fordBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avisoTexto: { color: '#fff', fontSize: 13, fontWeight: '500' },
  avisoCancelar: { color: '#fff', fontSize: 13, fontWeight: '700' },
  lista: { padding: 12, gap: 8 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardMarcado: {
    borderColor: Colors.fordBlue,
    borderWidth: 2,
  },
  cardInfo: { flex: 1, padding: 14, gap: 3 },
  cardTitulo: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  cardSub: { fontSize: 13, color: Colors.textSecondary },
  botaoComparar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  botaoComparaMarcado: {
    backgroundColor: Colors.fordBlue,
    borderLeftColor: Colors.fordBlue,
  },
  botaoCompararTexto: { fontSize: 13, fontWeight: '600', color: Colors.fordBlue },
  botaoCompararTextoMarcado: { color: '#fff' },
});
