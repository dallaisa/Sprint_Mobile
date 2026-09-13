import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { loadHistory, saveToHistory } from '@/src/storage/history';
import type { VeiculoRef } from '@/src/types/api';
import type { Ficha } from '@/src/types/spec';
import { getFicha } from '@/src/api/specs';
import { ApiError } from '@/src/api/http';
import { parseApiDate, veiculoDoId, versaoDaSugestao } from '@/src/api/adapters';
import { SpecCard } from '@/src/components/SpecCard';
import { Colors } from '@/src/theme/colors';

type Aviso = { tipo: 'ok' | 'erro'; texto: string };
type Sugestao = { texto: string; versao: string | null };

export default function FichaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [spec, setSpec] = useState<Ficha | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);

  /** Busca a ficha salva na API (sem chamar o Gemini) e grava no histórico. */
  async function buscarNaApi(veiculo: VeiculoRef): Promise<Ficha | null> {
    setAviso(null);
    setSugestoes([]);
    try {
      const ficha = await getFicha(veiculo);
      await saveToHistory(ficha);
      const salva = (await loadHistory()).find((item) => item.id === ficha.id) ?? ficha;
      if (ativo.current) setSpec(salva);
      return salva;
    } catch (error) {
      if (!ativo.current) return null;
      if (error instanceof ApiError && error.status === 404) {
        const opcoes = error.sugestoes.map((texto) => ({ texto, versao: versaoDaSugestao(texto, veiculo.marca, veiculo.modelo) }));
        setSugestoes(opcoes);
        setAviso({
          tipo: 'erro',
          texto: opcoes.length
            ? 'Esta versão não está salva no SpecRadar. Estas versões do mesmo modelo estão disponíveis:'
            : 'Esta ficha não está salva no SpecRadar. Consulte o carro de novo na Análise guiada.',
        });
      } else {
        setAviso({ tipo: 'erro', texto: error instanceof Error ? error.message : 'Não foi possível atualizar a ficha. Tente novamente.' });
      }
      return null;
    }
  }

  useEffect(() => {
    if (!id) return;
    setCarregando(true);
    setSpec(null);
    loadHistory()
      .then(async (items) => {
        const local = items.find((item) => item.id === id);
        if (local) {
          if (ativo.current) setSpec(local);
          return;
        }
        // Fora do histórico do aparelho: tenta a ficha salva na API.
        const veiculo = veiculoDoId(id);
        if (veiculo) await buscarNaApi(veiculo);
        else if (ativo.current) setAviso({ tipo: 'erro', texto: 'Ficha não encontrada.' });
      })
      .finally(() => { if (ativo.current) setCarregando(false); });
  }, [id]);

  async function atualizar() {
    if (!spec || atualizando) return;
    setAtualizando(true);
    const ficha = await buscarNaApi(spec);
    if (ficha && ativo.current) setAviso({ tipo: 'ok', texto: 'Ficha atualizada com os dados salvos no SpecRadar.' });
    if (ativo.current) setAtualizando(false);
  }

  async function abrirSugestao(versao: string) {
    const base = spec ?? (id ? veiculoDoId(id) : null);
    if (!base || atualizando) return;
    setAtualizando(true);
    const ficha = await buscarNaApi({ marca: base.marca, modelo: base.modelo, versao });
    if (ativo.current) setAtualizando(false);
    if (ficha) router.replace({ pathname: '/ficha/[id]', params: { id: ficha.id } });
  }

  const data = spec ? parseApiDate(spec.consultado_em) : null;

  return (
    <>
      <Stack.Screen
        options={{ title: spec ? `${spec.marca} ${spec.modelo}` : 'Ficha Técnica' }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        {carregando && <ActivityIndicator size="large" color={Colors.fordBlue} accessibilityLabel="Carregando ficha" />}
        {spec && (
          <View style={styles.barra}>
            <Text style={styles.data}>{data ? `Dados de ${data.toLocaleDateString('pt-BR')}` : 'Data não informada'}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Atualizar ficha com os dados salvos no SpecRadar"
              accessibilityState={{ disabled: atualizando }}
              disabled={atualizando}
              onPress={atualizar}
              style={[styles.botao, atualizando && styles.botaoDesabilitado]}
            >
              {atualizando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.botaoTexto}>Atualizar</Text>}
            </Pressable>
          </View>
        )}
        {aviso && (
          <View style={[styles.aviso, aviso.tipo === 'erro' && styles.avisoErro]}>
            <Text accessibilityRole="alert" style={[styles.avisoTexto, aviso.tipo === 'erro' && styles.avisoTextoErro]}>{aviso.texto}</Text>
            {sugestoes.map((sugestao) => sugestao.versao ? (
              <Pressable
                key={sugestao.texto}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${sugestao.texto}`}
                disabled={atualizando}
                onPress={() => abrirSugestao(sugestao.versao!)}
                style={styles.sugestao}
              >
                <Text style={styles.sugestaoTexto}>{sugestao.texto} ↗</Text>
              </Pressable>
            ) : (
              <Text key={sugestao.texto} style={styles.avisoTexto}>{sugestao.texto}</Text>
            ))}
          </View>
        )}
        {spec && <SpecCard spec={spec} />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12 },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  data: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  botao: { backgroundColor: Colors.fordBlue, borderRadius: 20, paddingHorizontal: 16, minHeight: 44, minWidth: 104, alignItems: 'center', justifyContent: 'center' },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#fff', fontWeight: '600', fontSize: 13 },
  aviso: { backgroundColor: Colors.compareWinner, borderRadius: 16, padding: 14, gap: 8 },
  avisoErro: { backgroundColor: '#fdecea' },
  avisoTexto: { color: Colors.success, fontSize: 13, lineHeight: 19 },
  avisoTextoErro: { color: Colors.textPrimary },
  sugestao: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' },
  sugestaoTexto: { color: Colors.fordBlue, fontSize: 13, fontWeight: '600' },
});
