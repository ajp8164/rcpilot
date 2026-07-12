import React from 'react';
import { Platform, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemeManager } from '@react-native-hello/ui';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from '@callstack/liquid-glass';

import { GlassView } from './GlassView';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const SCALE_PRESSED = 1.4;

// Renders a native liquid glass button on iOS 26+.
// Falls back to GlassView (blur) with press animation on older iOS / Android.
export const LiquidGlassButton = ({
  children,
  style,
  onPress,
}: LiquidGlassButtonProps) => {
  const s = useStyles();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(SCALE_PRESSED, { damping: 15, stiffness: 200 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  if (Platform.OS === 'ios' && isLiquidGlassSupported) {
    return (
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={animatedStyle}>
          <LiquidGlassView style={[s.container, style]}>
            {children}
          </LiquidGlassView>
        </Animated.View>
      </Pressable>
    );
  }

  // Fallback for older iOS and Android.
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={animatedStyle}>
        <GlassView style={[s.container, style] as ViewStyle[]}>
          {children}
        </GlassView>
      </Animated.View>
    </Pressable>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  container: {
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
}));
