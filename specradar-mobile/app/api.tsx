import { ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { EmptyPanel, PageIntro, ui } from '@/src/components/radar-ui';
import { Colors } from '@/src/theme/colors';

export default function ApiScreen() {
  const configured = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  return <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={ui.content} contentInsetAdjustmentBehavior="automatic">
    <Stack.Screen options={{ headerShown: true, title: 'API SpecRadar', headerTintColor: Colors.textPrimary, headerStyle: { backgroundColor: Colors.background }, headerShadowVisible: false }} />
    <PageIntro eyebrow="FONTE DOS DADOS" title="Seu acesso às fichas." description="Entenda de onde vêm as informações usadas nas consultas." />
    <View style={ui.panel}><Text style={ui.title}>{configured ? 'API configurada' : 'Modo demonstração'}</Text><Text style={ui.description}>{configured ? 'As consultas usam o serviço configurado no aplicativo. A disponibilidade é verificada ao consultar um veículo.' : 'Nenhuma API externa está configurada. As consultas retornam dados demonstrativos de uma Ranger Raptor, mesmo ao escolher outro modelo.'}</Text></View>
    <EmptyPanel icon="api" title="Faça uma consulta" description="Selecione marca, modelo e os atributos que deseja analisar. A ficha retornada mostra os dados e o nível de confiança." href="/(tabs)/formulario" action="Consultar ficha" />
  </ScrollView>;
}
