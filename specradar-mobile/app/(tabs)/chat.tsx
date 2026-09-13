import { HomeBackground } from '@/src/components/screen-background';
import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '@/src/hooks/useChat';
import { partesDaMensagem } from '@/src/api/adapters';
import { Colors } from '@/src/theme/colors';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { ChatSpecResult } from '@/src/components/chat-spec-result';
import { PageIntro, ui } from '@/src/components/radar-ui';

const chatCover = require('@/assets/capaChat.png');
const chatCoverSize = Image.resolveAssetSource(chatCover);

// O chat da API só reconhece marcas e modelos de uma lista fixa (Ford: Ranger, Territory, Bronco, Maverick, Edge, Expedition).
const SUGESTOES = ['Motor e potência da Ford Ranger Raptor', 'Especificações da Ford Territory', 'Consumo e preço da Ford Maverick', 'Ford Bronco Sport'];
const MIN_MENSAGEM = 3;
const MAX_MENSAGEM = 500;

function MensagemAssistente({ texto }: { texto: string }) {
  return <Text selectable style={s.assistantText}>{partesDaMensagem(texto).map((parte, index) => (
    <Text key={index} style={parte.estilo === 'negrito' ? s.bold : parte.estilo === 'italico' ? s.italic : undefined}>{parte.texto}</Text>
  ))}</Text>;
}

export default function ChatScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const contentOffset = useRef(0);
  const [input, setInput] = useState('');
  const [sent, setSent] = useState('');
  const { reply, loading, error, send, reset } = useChat();
  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const [coverWidth, setCoverWidth] = useState(0);
  const coverHeight = Math.min(
    (coverWidth || Math.min(width, 560)) * chatCoverSize.height / chatCoverSize.width,
    height * 0.72,
    620,
  );
  function consult(text: string) {
    if (text.trim().length < MIN_MENSAGEM || loading) return;
    setSent(text.trim());
    setInput('');
    send(text);
  }
  const canSend = !loading && input.trim().length >= MIN_MENSAGEM;
  return <HomeBackground><KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight}>
    {isFocused && <StatusBar style="dark" />}
    <ScrollView ref={scrollRef} style={{ flex: 1, minWidth: 0 }} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
      <View style={{ width: '100%', backgroundColor: '#fff', borderBottomLeftRadius: 44, borderBottomRightRadius: 44, overflow: 'hidden', paddingBottom: 12 }}>
      <View onLayout={({ nativeEvent }) => setCoverWidth(nativeEvent.layout.width)} style={{ width: Math.min(width, 560), maxWidth: '100%', height: coverHeight, alignSelf: 'center' }}>
        <Image source={chatCover} resizeMode="contain" accessibilityLabel="SpecRadar: dados que guiam decisões" style={{ width: '100%', height: '100%' }} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Ir para o conteúdo do chat" onPress={() => scrollRef.current?.scrollTo({ y: contentOffset.current, animated: true })} style={({ pressed }) => ({ alignSelf: 'flex-end', marginRight: 20, marginTop: -Math.min(coverHeight * 0.1, 44), marginBottom: 4, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(2, 173, 255, 1)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
        <MaterialIcons name="arrow-downward" size={32} color="#fff" />
      </Pressable>
      </View>
      <View onLayout={({ nativeEvent }) => { contentOffset.current = nativeEvent.layout.y; }} style={ui.content}>
      <View style={s.header}><View style={s.avatar}><MaterialIcons name="auto-awesome" size={24} color={Colors.fordBlue} /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.name}>Radar Assistente</Text><Text style={s.status}>Seu guia de fichas técnicas</Text></View><Pressable disabled={loading} accessibilityRole="button" accessibilityLabel="Nova consulta" onPress={() => { reset(); setSent(''); setInput(''); }} style={s.newChat}><MaterialIcons name="edit-square" size={22} color={Colors.fordBlue} /></Pressable></View>
      {!sent && <><PageIntro light eyebrow="CONHEÇA. COMPARE. ESCOLHA." title={'Grandes escolhas começam\ncom uma boa pergunta.'} description="Pergunte por um carro com marca e modelo. Eu organizo os dados técnicos para você explorar cada detalhe." /><View style={s.feature}><Image source={require('@/assets/carro1.png')} style={s.photo} resizeMode="cover" accessibilityLabel="Ford Fiesta" /><View style={s.featureCopy}><Text style={s.featureTitle}>Qual é o seu próximo carro?</Text><Text style={s.featureText}>Motor, desempenho e dimensões em uma consulta.</Text></View></View><Text style={s.section}>Comece por um modelo</Text><View style={s.suggestions}>{SUGESTOES.map(text => <Pressable accessibilityRole="button" key={text} onPress={() => consult(text)} style={s.suggestion}><MaterialIcons name="directions-car" size={18} color={Colors.fordBlue} /><Text style={s.suggestionText}>{text}</Text><MaterialIcons name="north-east" size={17} color={Colors.fordBlue} /></Pressable>)}</View></>}
      {!!sent && <><View style={s.userBubble}><Text selectable style={s.userText}>{sent}</Text></View><View style={s.assistantBubble}><Text style={s.assistantLabel}>✳ RADAR ASSISTENTE</Text>{loading ? <Text style={s.assistantText}>Buscando a ficha técnica… Se ninguém consultou este carro antes, pode levar até 1 minuto.</Text> : error ? <Text style={s.assistantText}>Não consegui concluir essa consulta. Você pode tentar novamente abaixo.</Text> : reply ? <MensagemAssistente texto={reply.mensagem} /> : null}</View></>}
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorMessage erro={error} onRetry={() => consult(sent)} />}
      {reply?.ficha && <ChatSpecResult key={`${reply.ficha.id}:${reply.ficha.consultado_em}`} spec={reply.ficha} />}
      </View>
    </ScrollView>
    <View style={s.composerArea}><View style={s.composer}><TextInput style={s.input} placeholder="Ex.: motor e potência da Ford Ranger…" placeholderTextColor={Colors.textSecondary} accessibilityLabel="Pergunta sobre um veículo" value={input} onChangeText={setInput} onSubmitEditing={() => consult(input)} returnKeyType="send" editable={!loading} maxLength={MAX_MENSAGEM} /><Pressable accessibilityRole="button" accessibilityLabel="Enviar pergunta" disabled={!canSend} accessibilityState={{ disabled: !canSend }} onPress={() => consult(input)} style={[s.send, !canSend && { opacity: 0.4 }]}><MaterialIcons name="arrow-upward" size={22} color="#fff" /></Pressable></View><Text style={s.note}>Dados organizados por atributo e nível de confiança.</Text></View>
  </KeyboardAvoidingView></HomeBackground>;
}
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: 'transparent' }, header: { flexDirection: 'row', gap: 12, alignItems: 'center' }, avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DCEBF5', alignItems: 'center', justifyContent: 'center' }, name: { color: '#fff', fontWeight: '600', fontSize: 16 }, status: { color: '#fff', fontSize: 11 }, newChat: { padding: 12, borderRadius: 24, backgroundColor: '#fff' }, feature: { height: 195, borderRadius: 26, overflow: 'hidden' }, photo: { width: '100%', height: '100%' }, featureCopy: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 5, backgroundColor: '#315D7BEF' }, featureTitle: { color: '#fff', fontSize: 18, fontWeight: '600' }, featureText: { color: '#DFEBF3', fontSize: 12 }, section: { color: '#fff', fontSize: 17, fontWeight: '600' }, suggestions: { gap: 9 }, suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 26, padding: 15, backgroundColor: '#E0EBF3' }, suggestionText: { flex: 1, color: Colors.fordBlue, fontSize: 13 }, userBubble: { alignSelf: 'flex-end', maxWidth: '88%', backgroundColor: Colors.fordBlue, padding: 18, borderRadius: 24, borderBottomRightRadius: 7 }, userText: { color: '#fff', fontSize: 15 }, assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 24, borderBottomLeftRadius: 7, padding: 20, gap: 12 }, assistantLabel: { fontSize: 10, letterSpacing: 1.5, color: Colors.fordBlue, fontWeight: '700' }, assistantText: { fontSize: 14, lineHeight: 22, color: Colors.textPrimary }, bold: { fontWeight: '700' }, italic: { fontStyle: 'italic', color: Colors.textSecondary }, composerArea: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 8, width: '100%', maxWidth: 620, alignSelf: 'center' }, composer: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingLeft: 17, gap: 8, backgroundColor: '#fff', borderRadius: 32, borderWidth: 1, borderColor: Colors.border }, input: { flex: 1, minWidth: 0, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary }, send: { width: 44, height: 44, borderRadius: 24, backgroundColor: Colors.fordBlue, alignItems: 'center', justifyContent: 'center' }, note: { color: '#fff', fontSize: 10, textAlign: 'center' } });
