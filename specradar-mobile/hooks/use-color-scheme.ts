import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

// RN 0.83+ pode retornar 'unspecified' — normalizamos para 'light'
export function useColorScheme(): ColorScheme {
  const scheme = useRNColorScheme();
  if (scheme === 'dark') return 'dark';
  return 'light';
}
