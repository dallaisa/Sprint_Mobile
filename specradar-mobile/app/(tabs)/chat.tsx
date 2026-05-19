import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSpecQuery } from '@/src/hooks/useSpecQuery';
import { Colors, ATRIBUTOS_PADRAO } from '@/src/theme/colors';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { SpecCard } from '@/src/components/SpecCard';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const { data, loading, error, execute, reset } = useSpecQuery();

  function parseInput(text: string) {
    const parts = text.trim().split(/\s+/);
    const marca = parts[0] ?? '';
    const modelo = parts.slice(1).join(' ') || marca;
    return { marca, modelo, atributos: ATRIBUTOS_PADRAO };
  }

  function handleConsultar() {
    if (!input.trim()) return;
    execute(parseInput(input));
  }

  function handleNovo() {
    reset();
    setInput('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.instrucao}>
          Digite a marca e modelo do veículo para consultar a ficha técnica.
        </Text>
        <Text style={styles.exemplo}>Ex: Toyota Hilux, Chevrolet S10, Mitsubishi L200</Text>

        {!data ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ford Ranger Raptor"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleConsultar}
              returnKeyType="search"
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.botao, loading && styles.botaoDesabilitado]}
              onPress={handleConsultar}
              disabled={loading || !input.trim()}
            >
              <Text style={styles.botaoTexto}>Consultar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.botaoNovo} onPress={handleNovo}>
            <Text style={styles.botaoNovoTexto}>Nova consulta</Text>
          </TouchableOpacity>
        )}

        {loading && <LoadingSpinner />}

        {error && !loading && (
          <ErrorMessage erro={error} onRetry={() => execute(parseInput(input))} />
        )}

        {data && <SpecCard spec={data} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12 },
  instrucao: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  exemplo: { fontSize: 13, color: Colors.textSecondary },
  inputRow: { gap: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  botao: {
    backgroundColor: Colors.fordBlue,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
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
