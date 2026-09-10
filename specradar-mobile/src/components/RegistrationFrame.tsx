import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import type { ReactNode } from 'react';
import { Palette } from '@/src/theme/theme';

type Props = {
  children: ReactNode;
  /** Length of each crop-mark arm. */
  size?: number;
  /** Stroke thickness of the marks. */
  thickness?: number;
  /** How far the marks sit outside the frame corners. */
  offset?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Wraps content in four registration / crop marks — the "specification board"
 * framing. Marks sit just outside the content corners so the child keeps its
 * own square edges. Uses padding-free absolute corners so it composes over
 * images, cards, anything.
 */
export function RegistrationFrame({
  children,
  size = 14,
  thickness = 1.5,
  offset = 6,
  color = Palette.navy,
  style,
}: Props) {
  const arm = (extra: ViewStyle): ViewStyle => ({
    position: 'absolute',
    width: size,
    height: size,
    borderColor: color,
    ...extra,
  });

  return (
    <View style={[styles.wrap, style]}>
      {children}
      <View pointerEvents="none" style={arm({ top: -offset, left: -offset, borderTopWidth: thickness, borderLeftWidth: thickness })} />
      <View pointerEvents="none" style={arm({ top: -offset, right: -offset, borderTopWidth: thickness, borderRightWidth: thickness })} />
      <View pointerEvents="none" style={arm({ bottom: -offset, left: -offset, borderBottomWidth: thickness, borderLeftWidth: thickness })} />
      <View pointerEvents="none" style={arm({ bottom: -offset, right: -offset, borderBottomWidth: thickness, borderRightWidth: thickness })} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
});
