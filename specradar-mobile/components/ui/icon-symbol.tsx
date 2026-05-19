import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';

// Mapeamento SF Symbols (iOS) → MaterialIcons (Android/cross-platform)
const SF_TO_MATERIAL: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'message.fill': 'chat',
  'doc.text.fill': 'description',
  'clock.fill': 'history',
  'chart.bar.fill': 'bar-chart',
  'magnifyingglass': 'search',
  'house.fill': 'home',
  'person.fill': 'person',
  'gear': 'settings',
  'xmark': 'close',
  'checkmark': 'check',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'square.and.arrow.up': 'share',
  'arrow.clockwise': 'refresh',
  'exclamationmark.triangle.fill': 'warning',
};

type Props = {
  name: keyof typeof SF_TO_MATERIAL;
  size?: number;
  color?: string;
};

export function IconSymbol({ name, size = 24, color = '#000' }: Props) {
  const materialName = SF_TO_MATERIAL[name] ?? 'help-outline';
  return <MaterialIcons name={materialName} size={size} color={color} />;
}
