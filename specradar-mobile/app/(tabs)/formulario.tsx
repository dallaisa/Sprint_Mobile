import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSpecQuery } from '@/src/hooks/useSpecQuery';
import { Colors, ATRIBUTOS_PADRAO } from '@/src/theme/colors';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { SpecCard } from '@/src/components/SpecCard';

const MARCA_REGEX = /^[A-Za-zÀ-ú\s\-]{2,40}$/;

export default function FormularioScreen() {
  const params = useLocalSearchParams<{ marca?: string; modelo?: string }>();
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [versao, setVersao] = useState('');
  const [atributosSelecionados, setAtributosSelecionados] = useState<string[]>([...ATRIBUTOS_PADRAO]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const { data, loading, error, execute, reset } = useSpecQuery();

  useEffect(() => {
    if (params.marca && params.modelo) {
      reset();
      setMarca(params.marca);
      setModelo(params.modelo);
      setVersao('');
      setErros({});
    }
  }, [params.marca, params.modelo, reset]);

  function validar(): boolean {
    const novosErros: Record<string, string> = {};
    if (!MARCA_REGEX.test(marca)) novosErros.marca = 'Marca inválida (2–40 letras).';
    if (modelo.length < 2 || modelo.length > 80) novosErros.modelo = 'Modelo: 2 a 80 caracteres.';
    if (versao && (versao.length < 1 || versao.length > 20)) novosErros.versao = 'Versão: 1 a 20 caracteres.';
    if (atributosSelecionados.length === 0) novosErros.atributos = 'Selecione ao menos 1 atributo.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleConsultar() {
    if (!validar()) return;
    execute({ marca: marca.trim(), modelo: modelo.trim(), versao: versao.trim() || undefined, atributos: atributosSelecionados });
  }

  function toggleAtributo(attr: string) {
    setAtributosSelecionados((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  }

  function handleNovo() {
    reset();
    setMarca('');
    setModelo('');
    setVersao('');
    setAtributosSelecionados([...ATRIBUTOS_PADRAO]);
    setErros({});
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {!data ? (
          <>
            <Campo
              label="Marca *"
              value={marca}
              onChangeText={setMarca}
              placeholder="Ex: Toyota"
              erro={erros.marca}
              editable={!loading}
            />
            <Campo
              label="Modelo *"
              value={modelo}
              onChangeText={setModelo}
              placeholder="Ex: Hilux"
              erro={erros.modelo}
              editable={!loading}
            />
            <Campo
              label="Versão (opcional)"
              value={versao}
              onChangeText={setVersao}
              placeholder="Ex: 2024 SR"
              erro={erros.versao}
              editable={!loading}
            />

            <Text style={styles.label}>Atributos</Text>
            <View style={styles.chips}>
              {ATRIBUTOS_PADRAO.map((attr) => {
                const ativo = atributosSelecionados.includes(attr);
                return (
                  <TouchableOpacity
                    key={attr}
                    style={[styles.chip, ativo && styles.chipAtivo]}
                    onPress={() => toggleAtributo(attr)}
                    disabled={loading}
                  >
                    <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>
                      {attr.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {erros.atributos && <Text style={styles.erroTexto}>{erros.atributos}</Text>}

            <TouchableOpacity
              style={[styles.botao, loading && styles.botaoDesabilitado]}
              onPress={handleConsultar}
              disabled={loading}
            >
              <Text style={styles.botaoTexto}>Consultar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.botaoNovo} onPress={handleNovo}>
            <Text style={styles.botaoNovoTexto}>Nova consulta</Text>
          </TouchableOpacity>
        )}

        {loading && <LoadingSpinner />}

        {error && !loading && (
          <ErrorMessage erro={error} onRetry={handleConsultar} />
        )}

        {data && <SpecCard spec={data} atributosFiltro={atributosSelecionados} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ label, value, onChangeText, placeholder, erro, editable }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  erro?: string;
  editable?: boolean;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, erro ? styles.inputErro : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
      />
      {erro && <Text style={styles.erroTexto}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  inputErro: { borderColor: Colors.error },
  erroTexto: { color: Colors.error, fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipAtivo: { backgroundColor: Colors.fordBlue, borderColor: Colors.fordBlue },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextAtivo: { color: '#fff' },
  botao: {
    backgroundColor: Colors.fordBlue,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  botaoNovo: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.fordBlue,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  botaoNovoTexto: { color: Colors.fordBlue, fontWeight: '600' },
});
