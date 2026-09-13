import { AnalysisHero, AttributeSelector } from '@/src/components/analysis-controls';
import { HOME_GRADIENT } from '@/src/components/screen-background';
import { VehicleCarousel } from '@/src/components/vehicle-carousel';
import { VEHICLES } from '@/src/data/vehicles';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CoverageChart } from '@/src/components/coverage-chart';
import { loadHistory } from '@/src/storage/history';
import type { Ficha } from '@/src/types/spec';
import { ATRIBUTOS_PADRAO, MAX_ATRIBUTOS } from '@/src/data/atributos';
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
import { Colors } from '@/src/theme/colors';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { SpecCard } from '@/src/components/SpecCard';

import { MARCA_REGEX, MODELO_REGEX, VERSAO_PADRAO, VERSAO_REGEX } from '@/src/api/validacao';

export default function FormularioScreen() {
  const params = useLocalSearchParams<{ marca?: string; modelo?: string }>();
  const [marca, setMarca] = useState('');
  const [search, setSearch] = useState('');
  const [modelo, setModelo] = useState('');
  const [versao, setVersao] = useState('');
  const [atributosSelecionados, setAtributosSelecionados] = useState<string[]>([...ATRIBUTOS_PADRAO]);
  const [errosLocais, setErros] = useState<Record<string, string>>({});
  const { data, loading, error, camposInvalidos, execute, retry, reset } = useSpecQuery();
  const erros = { ...camposInvalidos, ...errosLocais };
  const [history, setHistory] = useState<Ficha[]>([]);
  useFocusEffect(useCallback(() => {
    let active = true;
    loadHistory().then(items => { if (active) setHistory(items); }).catch(() => { if (active) setHistory([]); });
    return () => { active = false; };
  }, [data, loading]));

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
    if (!MARCA_REGEX.test(marca.trim())) novosErros.marca = 'Marca: 2 a 50 letras (espaços e hífens são aceitos).';
    if (!MODELO_REGEX.test(modelo.trim())) novosErros.modelo = 'Modelo: 2 a 80 letras, sem números (regra da API).';
    if (versao.trim() && !VERSAO_REGEX.test(versao.trim())) novosErros.versao = 'Versão: 2 a 80 caracteres entre letras, números, espaço, hífen e ponto.';
    if (atributosSelecionados.length === 0) novosErros.atributos = 'Selecione ao menos 1 atributo.';
    if (atributosSelecionados.length > MAX_ATRIBUTOS) novosErros.atributos = `Selecione no máximo ${MAX_ATRIBUTOS} atributos.`;
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleConsultar() {
    if (!validar()) return;
    execute({ marca: marca.trim(), modelo: modelo.trim(), versao: versao.trim() || VERSAO_PADRAO, atributos: atributosSelecionados });
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
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AnalysisHero search={search} onSearch={setSearch} selected={atributosSelecionados} onChange={setAtributosSelecionados} disabled={loading} />
        {!data ? (
          <>
            <VehicleCarousel vehicles={VEHICLES.filter(vehicle => ('Ford ' + vehicle.model).toLowerCase().includes(search.toLowerCase().trim()))} analysis selectedModel={modelo} disabled={loading} onSelect={vehicle => {
              setMarca('Ford');
              setModelo(vehicle.model);
              setVersao('');
              setErros({});
            }} />
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
              placeholder="Ex: XLT · em branco consulta a versão base"
              erro={erros.versao}
              editable={!loading}
            />

            <AttributeSelector selected={atributosSelecionados} onChange={setAtributosSelecionados} disabled={loading} />
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

        {loading && <LoadingSpinner mensagem="Buscando a ficha… Na primeira consulta de um carro, a API pesquisa as especificações e pode levar até 1 minuto." />}

        {error && !loading && (
          <ErrorMessage erro={error} onRetry={retry} />
        )}

        <CoverageChart history={history} />
        {data && <Text style={styles.origem}>{data.cache_hit ? 'Ficha já salva no SpecRadar · resposta do banco' : 'Ficha pesquisada agora pela API'}</Text>}
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
  scroll: { padding: 22, paddingBottom: 32, gap: 18, width: '100%', maxWidth: 620, alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    padding: 12,
    fontSize: 15,
  },
  inputErro: { borderColor: Colors.error },
  erroTexto: { color: Colors.error, fontSize: 12 },
  origem: { color: Colors.textSecondary, fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipAtivo: { backgroundColor: Colors.fordBlue, borderColor: Colors.fordBlue },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextAtivo: { color: '#fff' },
  botao: {
    backgroundColor: '#507EB0',
    experimental_backgroundImage: HOME_GRADIENT,
    borderRadius: 24,
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
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
  },
  botaoNovoTexto: { color: Colors.fordBlue, fontWeight: '600' },
});
