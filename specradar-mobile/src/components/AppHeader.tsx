import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Palette, Fonts, Radius, Space } from '@/src/theme/theme';

type Props = {
  /** Small eyebrow above the wordmark. */
  eyebrow?: string;
  title?: string;
  /** Opens the profile (where "Sair" now lives). */
  onAccountPress?: () => void;
};

/**
 * Clean header: transparent over the ground, Barlow Condensed wordmark, a 1px
 * hairline dividing it from content, and the account entry point on the right.
 * "Sair" no longer lives here — it moves into the profile behind the account
 * icon.
 */
export function AppHeader({
  eyebrow = 'FORD INTELLIGENCE',
  title = 'SpecRadar',
  onAccountPress,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Space.sm }]}>
      <View style={styles.row}>
        <View style={styles.brand}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          onPress={onAccountPress}
          style={({ pressed }) => [styles.account, pressed && styles.pressed]}
          hitSlop={8}
        >
          <MaterialIcons name="person-outline" size={26} color={Palette.navy} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { gap: 3 },
  eyebrow: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 13,
    letterSpacing: 2.4,
    color: Palette.blue,
  },
  title: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 35,
    lineHeight: 35 ,
    letterSpacing: 0,
    color: Palette.navy,
  },
  account: {
    width: 58,
    height: 58,
    borderRadius: Radius.hair,
    borderWidth: 1,
    borderColor: Palette.hairlineStrong,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
});
