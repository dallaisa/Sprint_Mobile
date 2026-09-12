import type { PropsWithChildren } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export const HOME_GRADIENT = 'linear-gradient(to right, rgba(80, 126, 176, 1) 0%, rgba(150, 184, 230, 1) 100%)';

export function HomeBackground({ children }: PropsWithChildren) {
  return <View style={styles.gradient}>{children}</View>;
}

export function PhotoBackground({ children }: PropsWithChildren) {
  return <ImageBackground source={require('@/assets/fundo2.jpg')} resizeMode="cover" style={styles.photo}>{children}</ImageBackground>;
}

const styles = StyleSheet.create({
  gradient: { flex: 1, backgroundColor: '#507EB0', experimental_backgroundImage: HOME_GRADIENT },
  photo: { flex: 1, backgroundColor: '#173E77' },
});
