import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemeManager } from '@react-native-hello/ui';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { GlassView } from './GlassView';

interface GlassBackgroundProps {
  // The animated Y position of the sheet (from top of screen).
  animatedPosition: SharedValue<number>;
  // Y position when fully expanded (opaque).
  fullY: number;
  // Y position at the mid snap point (opacity starts transitioning here).
  midY: number;
  // Y position when at peek (transparent).
  peekY: number;
  // Blur intensity for the glass layer.
  blurAmount?: number;
  // Starting opacity at peek/mid position.
  peekOpacity?: number;
  // Optional style override (e.g. from BottomSheet backgroundComponent).
  style?: StyleProp<ViewStyle>;
}

// A reusable glass blur background with animated opacity. Holds a constant
// transparency from peek to midY, then transitions to fully opaque at fullY.
export const GlassBackground = ({
  animatedPosition,
  fullY,
  midY,
  peekY,
  blurAmount = 2,
  peekOpacity = 0.3,
  style,
}: GlassBackgroundProps) => {
  const s = useStyles();

  const opaqueStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedPosition.value,
      [fullY, midY, peekY],
      [1, peekOpacity, peekOpacity],
      'clamp',
    ),
  }));

  return (
    <View style={[StyleSheet.absoluteFill, s.container, style]}>
      <GlassView style={StyleSheet.absoluteFill} blurAmount={blurAmount} />
      <Animated.View style={[StyleSheet.absoluteFill, s.opaque, opaqueStyle]} />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    borderRadius: theme.radius.XL,
    overflow: 'hidden',
  },
  opaque: {
    backgroundColor: theme.colors.viewBackground,
  },
}));
