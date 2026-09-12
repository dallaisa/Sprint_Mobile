import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, type Href } from 'expo-router';
import { Colors } from '@/src/theme/colors';

export function PageIntro({ eyebrow, title, description, light = false }: { eyebrow: string; title: string; description: string; light?: boolean }) {
  return <View style={{ gap: 8, paddingVertical: 10 }}><Text style={[ui.eyebrow, light && { color: '#fff' }]}>{eyebrow}</Text><Text accessibilityRole="header" style={[ui.title, light && { color: '#fff' }]}>{title}</Text><Text style={[ui.description, light && { color: '#fff' }]}>{description}</Text></View>;
}

export function Pill({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [ui.pill, selected && ui.pillActive, pressed && { opacity: 0.7 }]}><Text style={[ui.pillText, selected && { color: '#fff' }]}>{label}</Text></Pressable>;
}

export function EmptyPanel({ icon, title, description, href, action }: { icon: ComponentProps<typeof MaterialIcons>['name']; title: string; description: string; href: Href; action: string }) {
  return <View style={ui.panel}><View style={ui.icon}><MaterialIcons name={icon} size={28} color={Colors.fordBlue} /></View><Text style={ui.title}>{title}</Text><Text style={ui.description}>{description}</Text><Link href={href} asChild><Pressable accessibilityRole="button" style={ui.button}><Text style={ui.buttonText}>{action}</Text><MaterialIcons name="arrow-forward" size={20} color="#fff" /></Pressable></Link></View>;
}

export const ui = StyleSheet.create({
  content: { padding: 22, paddingBottom: 32, gap: 20, width: '100%', maxWidth: 620, alignSelf: 'center' },
  eyebrow: { color: Colors.fordBlue, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { color: Colors.textPrimary, fontSize: 28, lineHeight: 33, fontWeight: '600', letterSpacing: -0.8 },
  description: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
  panel: { backgroundColor: Colors.surface, borderRadius: 28, padding: 24, gap: 16, borderWidth: 1, borderColor: Colors.border },
  icon: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E1EDF6', alignItems: 'center', justifyContent: 'center' },
  pill: { borderRadius: 30, paddingHorizontal: 18, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4EDF5' },
  pillActive: { backgroundColor: Colors.fordBlue },
  pillText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  button: { backgroundColor: Colors.fordBlue, borderRadius: 30, paddingHorizontal: 22, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
