import { useBottomTabBarHeight } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTabContentInset() {
  const height = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  return height + Math.max(insets.bottom, 8);
}
