/**
 * Design tokens — "Industry / specification board" grammar.
 *
 * Ford blue (#003087) / navy (#041E42) as brand voice, mounted on a technical
 * ground (#f2f2f3), with Barlow Condensed titles, square corners, hairline
 * borders and registration marks. This is intentionally NOT a rounded, 32px
 * consumer look — it should read like a spec sheet.
 *
 * The legacy `Colors` in ./colors.ts is left untouched so screens that haven't
 * been redesigned yet keep rendering. New screens import from here.
 */

export const Palette = {
  // Brand voice
  navy: '#041E42',
  blue: '#003087',
  blueLight: '#1A4DB3',

  // Technical ground + surfaces
  ground: '#F2F2F3',
  surface: '#FFFFFF',

  // Ink
  ink: '#141719',
  inkMuted: '#6C727A',
  inkFaint: '#9AA0A6',

  // Hairlines / rules
  hairline: '#D8D9DD',
  hairlineStrong: '#B7B9BF',
  // Blueprint grid line — darker, translucent ink so the grid reads as a rule.
  gridLine: 'rgba(29,31,32,0.22)',

  // On-navy
  onNavy: '#FFFFFF',
  onNavyEyebrow: '#8FBBF2',
  onNavyMuted: '#B9CBE6',

  // States (kept aligned with legacy confidence colors)
  alta: '#2E7D32',
  inferida: '#E65100',
  naoEncontrado: '#9E9E9E',
  error: '#C62828',
} as const;

/**
 * Font family names as registered by expo-font in app/_layout.tsx.
 * If the Barlow packages fail to load, these strings simply fall back to the
 * system font (React Native does not crash on an unknown fontFamily), so the
 * industrial feel is preserved via weight + letter-spacing + uppercase even in
 * the worst case.
 */
export const Fonts = {
  // Barlow Condensed — titles, numerals, labels
  title: 'BarlowCondensed_700Bold',
  titleXBold: 'BarlowCondensed_800ExtraBold',
  label: 'BarlowCondensed_600SemiBold',
  // Barlow — body copy
  body: 'Barlow_400Regular',
  bodyMedium: 'Barlow_500Medium',
  bodySemibold: 'Barlow_600SemiBold',
} as const;

/** Square grammar — corners stay hard. */
export const Radius = {
  none: 0,
  hair: 2,
} as const;

export const Space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const Hairline = 1;

export const Theme = { Palette, Fonts, Radius, Space, Hairline } as const;
export default Theme;
