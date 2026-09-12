import { HomeBackground } from '@/src/components/screen-background';
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSpecQuery } from '@/src/hooks/useSpecQuery';
import { Colors, ATRIBUTOS_PADRAO } from '@/src/theme/colors';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { SpecCard } from '@/src/components/SpecCard';
import { PageIntro, ui } from '@/src/components/radar-ui';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [sent, setSent] = useState('');
  const { data, loading, error, execute, reset } = useSpecQuery();
  const headerHeight = useHeaderHeight();
  function consult(text: string) {
    if (!text.trim() || loading) return;
    const parts = text.trim().split(/\s+/);
    setSent(text.trim());
    setInput('');
    execute({ marca: parts[0], modelo: parts.slice(1).join(' ') || parts[0], atributos: ATRIBUTOS_PADRAO });
  }
  return <HomeBackground><KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight}>
    <ScrollView contentContainerStyle={ui.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
      <View style={s.header}><View style={s.avatar}><MaterialIcons name="auto-awesome" size={24} color={Colors.fordBlue} /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.name}>Radar Assistente</Text><Text style={s.status}>Seu guia de fichas técnicas</Text></View><Pressable disabled={loading} accessibilityRole="button" accessibilityLabel="Nova consulta" onPress={() => { reset(); setSent(''); setInput(''); }} style={s.newChat}><MaterialIcons name="edit-square" size={22} color={Colors.fordBlue} /></Pressable></View>
      {!sent && <><PageIntro light eyebrow="CONHEÇA. COMPARE. ESCOLHA." title={'Grandes escolhas começam\ncom uma boa pergunta.'} description="Digite marca e modelo. Eu organizo os dados técnicos para você explorar cada detalhe." /><View style={s.feature}><Image source={require('@/assets/carro1.png')} style={s.photo} resizeMode="cover" accessibilityLabel="Ford Fiesta" /><View style={s.featureCopy}><Text style={s.featureTitle}>Qual é o seu próximo carro?</Text><Text style={s.featureText}>Motor, desempenho e dimensões em uma consulta.</Text></View></View><Text style={s.section}>Comece por um modelo</Text><View style={s.suggestions}>{['Ford EcoSport', 'Ford Ka', 'Ford Edge', 'Ford Fiesta'].map(text => <Pressable accessibilityRole="button" key={text} onPress={() => consult(text)} style={s.suggestion}><MaterialIcons name="directions-car" size={18} color={Colors.fordBlue} /><Text style={s.suggestionText}>{text}</Text><MaterialIcons name="north-east" size={17} color={Colors.fordBlue} /></Pressable>)}</View></>}
      {!!sent && <><View style={s.userBubble}><Text selectable style={s.userText}>{sent}</Text></View><View style={s.assistantBubble}><Text style={s.assistantLabel}>✳ RADAR ASSISTENTE</Text><Text style={s.assistantText}>{loading ? 'Buscando a ficha técnica e organizando os atributos…' : error ? 'Não consegui concluir essa consulta. Você pode tentar novamente abaixo.' : 'Aqui está a ficha retornada para sua consulta. Confira o modelo, a versão e o nível de confiança de cada informação.'}</Text></View></>}
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorMessage erro={error} onRetry={() => consult(sent)} />}
      {data && <SpecCard spec={data} />}
    </ScrollView>
    <View style={s.composerArea}><View style={s.composer}><TextInput style={s.input} placeholder="Marca e modelo do veículo…" placeholderTextColor={Colors.textSecondary} accessibilityLabel="Marca e modelo do veículo" value={input} onChangeText={setInput} onSubmitEditing={() => consult(input)} returnKeyType="send" editable={!loading} /><Pressable accessibilityRole="button" accessibilityLabel="Consultar veículo" disabled={loading || !input.trim()} accessibilityState={{ disabled: loading || !input.trim() }} onPress={() => consult(input)} style={[s.send, (loading || !input.trim()) && { opacity: 0.4 }]}><MaterialIcons name="arrow-upward" size={22} color="#fff" /></Pressable></View><Text style={s.note}>Dados organizados por atributo e nível de confiança.</Text></View>
  </KeyboardAvoidingView></HomeBackground>;
}
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: 'transparent' }, header: { flexDirection: 'row', gap: 12, alignItems: 'center' }, avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DCEBF5', alignItems: 'center', justifyContent: 'center' }, name: { color: '#fff', fontWeight: '600', fontSize: 16 }, status: { color: '#fff', fontSize: 11 }, newChat: { padding: 12, borderRadius: 24, backgroundColor: '#fff' }, feature: { height: 195, borderRadius: 26, overflow: 'hidden' }, photo: { width: '100%', height: '100%' }, featureCopy: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 5, backgroundColor: '#315D7BEF' }, featureTitle: { color: '#fff', fontSize: 18, fontWeight: '600' }, featureText: { color: '#DFEBF3', fontSize: 12 }, section: { color: '#fff', fontSize: 17, fontWeight: '600' }, suggestions: { gap: 9 }, suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 26, padding: 15, backgroundColor: '#E0EBF3' }, suggestionText: { flex: 1, color: Colors.fordBlue, fontSize: 13 }, userBubble: { alignSelf: 'flex-end', maxWidth: '88%', backgroundColor: Colors.fordBlue, padding: 18, borderRadius: 24, borderBottomRightRadius: 7 }, userText: { color: '#fff', fontSize: 15 }, assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 24, borderBottomLeftRadius: 7, padding: 20, gap: 12 }, assistantLabel: { fontSize: 10, letterSpacing: 1.5, color: Colors.fordBlue, fontWeight: '700' }, assistantText: { fontSize: 14, lineHeight: 22, color: Colors.textPrimary }, composerArea: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 8, width: '100%', maxWidth: 620, alignSelf: 'center' }, composer: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingLeft: 17, gap: 8, backgroundColor: '#fff', borderRadius: 32, borderWidth: 1, borderColor: Colors.border }, input: { flex: 1, minWidth: 0, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary }, send: { width: 44, height: 44, borderRadius: 24, backgroundColor: Colors.fordBlue, alignItems: 'center', justifyContent: 'center' }, note: { color: '#fff', fontSize: 10, textAlign: 'center' } });
