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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '@/src/api/client';
import { Colors } from '@/src/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  function validar(): string | null {
    if (!nome.trim() || nome.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'E-mail inválido.';
    if (senha.length < 6) return 'Senha deve ter pelo menos 6 caracteres.';
    if (senha !== confirmarSenha) return 'As senhas não coincidem.';
    return null;
  }

  async function handleRegister() {
    const validacaoErro = validar();
    if (validacaoErro) {
      setErro(validacaoErro);
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await registerUser({ nome: nome.trim(), email: email.trim(), senha, role: 'ANALISTA' });
      router.replace('/login');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>SpecRadar</Text>
          <Text style={styles.subtitle}>Inteligência Competitiva Automotiva</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>

          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor={Colors.textSecondary}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={Colors.textSecondary}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            editable={!loading}
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            placeholderTextColor={Colors.textSecondary}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            editable={!loading}
            onSubmitEditing={handleRegister}
            returnKeyType="done"
          />

          {!!erro && <Text style={styles.erro}>{erro}</Text>}

          <TouchableOpacity
            style={[styles.botao, loading && styles.botaoDesabilitado]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.linkTexto}>
              Já tem conta? <Text style={styles.linkDestaque}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.fordBlue },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  erro: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: Colors.fordBlue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkContainer: { marginTop: 16, alignItems: 'center' },
  linkTexto: { fontSize: 14, color: Colors.textSecondary },
  linkDestaque: { color: Colors.fordBlue, fontWeight: '600' },
});
