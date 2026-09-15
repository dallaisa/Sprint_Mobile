import { useCallback, useRef, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { HOME_GRADIENT } from '@/src/components/screen-background';

function PageEntrance({ children, name }: { children: ReactNode; name: string }) {
  const progress = useRef(new Animated.Value(1)).current;

  useFocusEffect(useCallback(() => {
    let active = true;
    let preferenceChanged = false;
    const showImmediately = () => {
      progress.stopAnimation();
      progress.setValue(1);
    };
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', () => {
      preferenceChanged = true;
      showImmediately();
    });

    AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      if (!active || preferenceChanged) return;
      if (reduceMotion) {
        showImmediately();
        return;
      }
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }).catch(() => {
      if (active) showImmediately();
    });

    return () => {
      active = false;
      subscription.remove();
      showImmediately();
    };
  }, [progress]));

  const entranceStyle = {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
  };
  const background = name === 'home' || name === 'chat'
    ? styles.gradient
    : name === 'comparar' ? styles.dark : styles.default;

  return <View style={[styles.frame, background]}>
    <Animated.View style={[styles.fill, entranceStyle]}>{children}</Animated.View>
  </View>;
}

// Keep the nested tab navigator stationary; animate its individual pages instead.
export function pageEntranceLayout({ children, route }: { children: ReactNode; route: { name: string } }) {
  if (route.name === '(tabs)' || route.name === 'index' || route.name === 'register') {
    return <>{children}</>;
  }
  return <PageEntrance name={route.name}>{children}</PageEntrance>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  frame: { flex: 1, overflow: 'hidden' },
  default: { backgroundColor: Colors.background },
  gradient: { backgroundColor: '#507EB0', experimental_backgroundImage: HOME_GRADIENT },
  dark: { backgroundColor: '#151E27' },
});
