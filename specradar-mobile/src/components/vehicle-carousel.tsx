import { useEffect, useRef, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Vehicle } from '@/src/data/vehicles';

type Props = {
  vehicles: Vehicle[];
  onSelect: (vehicle: Vehicle) => void;
  analysis?: boolean;
  selectedModel?: string;
  disabled?: boolean;
};

export function VehicleCarousel({ vehicles, onSelect, analysis = false, selectedModel, disabled }: Props) {
  const [width, setWidth] = useState(320);
  const [active, setActive] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const cardWidth = Math.max(240, width - 12);
  const signature = vehicles.map(vehicle => vehicle.model).join('|');

  useEffect(() => {
    setActive(0);
    scroll.current?.scrollTo({ x: 0, animated: false });
  }, [signature, width]);

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={s.container}>
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        contentContainerStyle={s.track}
        onMomentumScrollEnd={event => setActive(Math.min(vehicles.length - 1, Math.max(0, Math.round(event.nativeEvent.contentOffset.x / (cardWidth + 12)))))}
      >
        {vehicles.map(vehicle => (
          <Pressable
            key={vehicle.model}
            accessibilityRole="button"
            accessibilityLabel={`${analysis ? 'Analisar' : 'Consultar'} Ford ${vehicle.model}`}
            accessibilityState={{ selected: selectedModel === vehicle.model, disabled: !!disabled }}
            disabled={disabled}
            onPress={() => onSelect(vehicle)}
            style={({ pressed }) => [s.card, { width: cardWidth, height: cardWidth * 0.82, opacity: pressed || disabled ? 0.7 : 1 }, selectedModel === vehicle.model && s.selected]}
          >
            <ImageBackground source={vehicle.image} resizeMode="cover" style={s.image} imageStyle={s.imageCorners}>
              <View style={s.top}>
                <Text style={s.tag}>{analysis ? 'ANÁLISE · ' : ''}{vehicle.category}</Text>
                <View style={s.icon}><MaterialIcons name={analysis ? 'analytics' : 'north-east'} size={19} color="#fff" /></View>
              </View>
              <View style={s.caption}>
                <View style={s.copy}>
                  <Text style={s.title}>Ford {vehicle.model}</Text>
                  <Text style={s.subtitle}>{analysis ? vehicle.analysis : vehicle.tagline}</Text>
                  <View style={s.detail}><MaterialIcons name={analysis ? 'tune' : 'directions-car'} size={12} color="#E9F3FF" /><Text style={s.meta}>{analysis ? 'Selecione para preencher a ficha' : `${vehicle.category} · Ficha técnica`}</Text></View>
                </View>
                <View style={s.button}><Text style={s.buttonLabel}>{analysis ? (selectedModel === vehicle.model ? 'Selecionado' : 'Analisar') : 'Ver'}</Text></View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </ScrollView>
      {vehicles.length > 1 && <View style={s.dots}>{vehicles.map((vehicle, index) => (
        <Pressable key={vehicle.model} accessibilityRole="button" accessibilityLabel={`Mostrar Ford ${vehicle.model}`} accessibilityState={{ selected: index === active }} onPress={() => { scroll.current?.scrollTo({ x: index * (cardWidth + 12), animated: true }); setActive(index); }} style={s.dotTarget}>
          <View style={[s.dot, active === index && s.activeDot]} />
        </Pressable>
      ))}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { width: '100%', minWidth: 0 },
  track: { gap: 12, paddingRight: 12 },
  card: { borderRadius: 26, overflow: 'hidden', backgroundColor: '#7396BF' },
  selected: { borderWidth: 2, borderColor: '#315D7B' },
  image: { flex: 1, justifyContent: 'space-between' },
  imageCorners: { borderRadius: 25 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  tag: { color: '#fff', backgroundColor: '#193D6599', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, fontSize: 10, fontWeight: '600' },
  icon: { borderRadius: 20, width: 33, height: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: '#193D6599' },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, backgroundColor: 'rgba(91, 137, 182, 0.86)', borderTopWidth: 1, borderTopColor: '#ffffff60' },
  copy: { flex: 1, gap: 5 },
  title: { color: '#fff', fontSize: 23, fontWeight: '600', letterSpacing: -0.4 },
  subtitle: { color: '#fff', fontSize: 11, lineHeight: 15 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { color: '#F0F6FE', fontSize: 10, flexShrink: 1 },
  button: { minHeight: 44, minWidth: 62, paddingHorizontal: 13, borderRadius: 24, backgroundColor: '#315B81', alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center' },
  dotTarget: { width: 44, height: 36, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#D8E6F7' },
  activeDot: { width: 20, backgroundColor: '#315D7B' },
});
