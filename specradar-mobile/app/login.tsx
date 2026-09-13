import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, ActivityIndicator, Image, Animated, BackHandler, Easing, Keyboard,
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput,
  View, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PhotoBackground } from '@/src/components/screen-background';
import { loginUser } from '@/src/api/client';
import { saveToken } from '@/src/storage/auth';

type Stage = 'welcome' | 'signin' | 'signup';
const blue = '#3861C4';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [stage, setStage] = useState<Stage>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [remember, setRemember] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const slide = useRef(new Animated.Value(0)).current;
  const reducedMotion = useRef(false);
  const transition = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(value => { reducedMotion.current = value; });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { reducedMotion.current = value; });
    return () => subscription.remove();
  }, []);

  function open(next: 'signin' | 'signup') {
    if (loading || transition.current) return;
    Keyboard.dismiss();
    setMessage('');
    setPassword('');
    setVisible(false);
    setStage(next);
    slide.setValue(0);
    Animated.timing(slide, { toValue: 1, duration: reducedMotion.current ? 0 : 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }

  function close() {
    if (loading || transition.current) return;
    Keyboard.dismiss();
    transition.current = true;
    Animated.timing(slide, { toValue: 0, duration: reducedMotion.current ? 0 : 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      transition.current = false;
      if (finished) { setStage('welcome'); setMessage(''); setPassword(''); }
    });
  }

  useEffect(() => {
    if (params.mode === 'signup' || params.mode === 'signin') open(params.mode);
  }, [params.mode]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stage === 'welcome') return false;
      close();
      return true;
    });
    return () => subscription.remove();
  }, [stage, loading]);

  async function submit() {
    if (loading) return;
    Keyboard.dismiss();
    const normalizedEmail = email.trim().toLowerCase();
    if (stage === 'signup' && name.trim().length < 2) { setMessage('Informe seu nome completo.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setMessage('Informe um e-mail válido.'); return; }
    if (!password) { setMessage('Informe sua senha.'); return; }
    if (stage === 'signup') {
      if (password.length < 6) { setMessage('Use pelo menos 6 caracteres na senha.'); return; }
      if (!accepted) { setMessage('Confirme a opção de cadastro para continuar.'); return; }
      setMessage('O cadastro ainda não está disponível. Por enquanto, somente a conta admin pode entrar.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      if (normalizedEmail !== 'admin@spec.com') throw new Error('Por enquanto, o acesso está disponível somente para o admin.');
      const result = await loginUser(normalizedEmail, password);
      await saveToken(result.token, result.expiraEm, remember);
      router.replace('/(tabs)/home');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    } finally { setLoading(false); }
  }

  const signup = stage === 'signup';
  return (
    <PhotoBackground>
      <StatusBar style="light" />
      <View pointerEvents="none" style={[s.shade, stage === 'welcome' && { backgroundColor: 'rgba(6, 28, 70, 0.38)' }]} />
      {stage === 'welcome' ? (
        <View style={[s.welcome, { paddingTop: insets.top + 28 }]}>
          <Text style={s.brand}>✳ SPECRADAR</Text>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.welcomeCopy, { paddingBottom: Math.min(height * 0.18, 150) }]} showsVerticalScrollIndicator={false}>
            <Text accessibilityRole="header" style={s.welcomeTitle}>Bem-vindo ao{ '\n' }seu próximo passo.</Text>
            <Text style={s.welcomeDescription}>Explore os detalhes.{ '\n' }Encontre novas possibilidades.</Text>
          </ScrollView>
          <View style={s.welcomeActions}>
            <Pressable accessibilityRole="button" onPress={() => open('signin')} style={[s.welcomeButton, { minHeight: 82 + insets.bottom, paddingBottom: insets.bottom }]}><Text style={s.welcomeButtonText}>Sign in</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => open('signup')} style={[s.welcomeButton, s.signupButton, { minHeight: 82 + insets.bottom, paddingBottom: insets.bottom }]}><Text style={[s.welcomeButtonText, { color: blue }]}>Sign up</Text></Pressable>
          </View>
        </View>
      ) : (
        <>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar à tela de boas-vindas" disabled={loading} onPress={close} style={[s.back, { top: insets.top + 14 }]}><MaterialIcons name="chevron-left" size={23} color="#fff" /><Text style={s.backText}>Voltar</Text></Pressable>
          <KeyboardAvoidingView style={s.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Animated.View style={[s.sheet, { maxHeight: '82%', transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] }]}>
              <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[s.form, { paddingBottom: Math.max(insets.bottom, 18) + 18, minHeight: Math.min(height * 0.64, 610) }]}>
                <View style={s.handle} />
                <Text accessibilityRole="header" style={s.formTitle}>{signup ? 'Comece por aqui' : 'Que bom ter você de volta'}</Text>
                <Text style={s.formSubtitle}>{signup ? 'Crie seu espaço no SpecRadar.' : 'Entre para explorar seu radar.'}</Text>
                {signup && <View style={s.field}><Text style={s.label}>Nome completo</Text><TextInput accessibilityLabel="Nome completo" style={s.input} placeholder="Seu nome completo" placeholderTextColor="#91A0B1" value={name} onChangeText={setName} autoComplete="name" editable={!loading} /></View>}
                <View style={s.field}><Text style={s.label}>E-mail</Text><TextInput accessibilityLabel="E-mail" style={s.input} placeholder="seu@email.com" placeholderTextColor="#91A0B1" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!loading} /></View>
                <View style={s.field}><Text style={s.label}>Senha</Text><View style={s.passwordRow}><TextInput accessibilityLabel="Senha" style={s.passwordInput} placeholder={signup ? 'Mínimo de 6 caracteres' : 'Sua senha'} placeholderTextColor="#91A0B1" value={password} onChangeText={setPassword} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} autoComplete={signup ? 'new-password' : 'current-password'} editable={!loading} onSubmitEditing={submit} returnKeyType="done" /><Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(value => !value)} style={s.eye}><MaterialIcons name={visible ? 'visibility-off' : 'visibility'} size={19} color="#8190A3" /></Pressable></View></View>
                <View style={s.options}>
                  <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: signup ? accepted : remember }} onPress={() => signup ? setAccepted(value => !value) : setRemember(value => !value)} style={s.checkboxRow} disabled={loading}><MaterialIcons name={(signup ? accepted : remember) ? 'check-box' : 'check-box-outline-blank'} size={23} color={blue} /><Text style={s.optionText}>{signup ? 'Quero criar uma conta no SpecRadar' : 'Lembrar de mim'}</Text></Pressable>
                  {!signup && <Pressable accessibilityRole="button" onPress={() => setMessage('A recuperação de senha ainda não está disponível. Use as credenciais de demonstração do admin.')} style={s.forgot}><Text style={s.link}>Esqueci a senha</Text></Pressable>}
                </View>
                {!!message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.message}>{message}</Text>}
                <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading }} disabled={loading} onPress={submit} style={[s.submit, loading && { opacity: 0.6 }]}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>{signup ? 'Sign up' : 'Sign in'}</Text>}</Pressable>
                <View style={s.divider}><View style={s.line} /><Text style={s.dividerText}>{signup ? 'ou cadastre-se com' : 'ou entre com'}</Text><View style={s.line} /></View>
                <View style={s.socials}>
                  {([{ provider: 'Facebook', icon: 'facebook-official', color: '#1877F2' }, { provider: 'Google', icon: 'google', color: '#4285F4' }, { provider: 'Apple', icon: 'apple', color: '#111827' }] as const).map(provider => <Pressable key={provider.provider} accessibilityRole="button" accessibilityLabel={`Continuar com ${provider.provider}`} disabled={loading} onPress={() => setMessage(`O acesso com ${provider.provider} ainda não está habilitado. Por enquanto, entre com a conta admin.`)} style={({ pressed }) => [s.social, pressed && { opacity: 0.5 }]}><>{provider.provider === 'Google' ? <Image source={require('@/assets/google.png')} style={{ width: 26, height: 26 }} resizeMode="contain" /> : <FontAwesome name={provider.icon} size={26} color={provider.color} />}</></Pressable>)}
                </View>
                <Pressable accessibilityRole="button" disabled={loading} onPress={() => open(signup ? 'signin' : 'signup')} style={s.switch}><Text style={s.switchText}>{signup ? 'Já tem uma conta? ' : 'Ainda não tem conta? '}<Text style={s.link}>{signup ? 'Sign in' : 'Sign up'}</Text></Text></Pressable>
                {!signup && <Text selectable style={s.demo}>Demo: admin@spec.com · 123456</Text>}
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </>
      )}
    </PhotoBackground>
  );
}

const s = StyleSheet.create({
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: '#061C4626' },
  welcome: { flex: 1, justifyContent: 'space-between' },
  brand: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 3, paddingHorizontal: 28 },
  welcomeCopy: { flexGrow: 1, justifyContent: 'center', padding: 30, gap: 18 },
  welcomeTitle: { color: '#fff', fontSize: 35, lineHeight: 42, fontWeight: '700', textAlign: 'center', letterSpacing: -0.8 },
  welcomeDescription: { color: '#F3F7FF', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  welcomeActions: { flexDirection: 'row', minHeight: 82 },
  welcomeButton: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 82 },
  welcomeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signupButton: { backgroundColor: '#fff', borderTopLeftRadius: 38 },
  back: { position: 'absolute', left: 20, zIndex: 2, flexDirection: 'row', gap: 3, alignItems: 'center', minHeight: 44, paddingRight: 14, borderRadius: 24, backgroundColor: '#16397145' },
  backText: { color: '#fff', fontSize: 13 },
  keyboard: { flex: 1, justifyContent: 'flex-end', paddingTop: 82 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden', width: '100%', maxWidth: 620, alignSelf: 'center' },
  form: { paddingHorizontal: 26, paddingTop: 12, gap: 15 },
  handle: { width: 34, height: 4, backgroundColor: '#E5EAF2', borderRadius: 3, alignSelf: 'center', marginBottom: 6 },
  formTitle: { color: blue, fontSize: 27, lineHeight: 33, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
  formSubtitle: { color: '#7C899B', textAlign: 'center', fontSize: 12, marginBottom: 7 },
  field: { gap: 6 },
  label: { color: '#43516A', fontSize: 11, paddingLeft: 12 },
  input: { minHeight: 49, borderWidth: 1, borderColor: '#E1E6ED', borderRadius: 15, paddingHorizontal: 14, fontSize: 14, color: '#1E304E' },
  passwordRow: { flexDirection: 'row', minHeight: 49, borderWidth: 1, borderColor: '#E1E6ED', borderRadius: 15, alignItems: 'center' },
  passwordInput: { flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E304E' },
  eye: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44, flexShrink: 1 },
  optionText: { color: '#758395', fontSize: 11, flexShrink: 1 },
  forgot: { minHeight: 44, justifyContent: 'center' },
  link: { color: blue, fontSize: 12, fontWeight: '600' },
  message: { color: '#8B3C26', backgroundColor: '#FFF3E9', padding: 12, borderRadius: 12, fontSize: 12, lineHeight: 18 },
  submit: { backgroundColor: blue, borderRadius: 16, minHeight: 52, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  divider: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#EEF0F5' },
  dividerText: { color: '#8D96A4', fontSize: 11 },
  socials: { flexDirection: 'row', justifyContent: 'center', gap: 30 },
  social: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  switch: { alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  switchText: { color: '#8D96A4', fontSize: 12 },
  demo: { color: '#8D96A4', fontSize: 10, textAlign: 'center' },
});
