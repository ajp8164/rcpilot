import React from 'react';
import { Platform, View, type ViewStyle } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { BlurView, type BlurViewProps } from '@react-native-community/blur';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  // iOS blur type. When not provided, auto-selects based on theme (xlight/xdark).
  blurType?: BlurViewProps['blurType'];
  // iOS blur intensity (default 1). Ignored on Android.
  blurAmount?: number;
  // Android fallback background color. Defaults to theme-appropriate transparent.
  fallbackColor?: string;
}

// Renders a BlurView on iOS for glass/frosted effects, and a semi-transparent
// solid View on Android as a Material-appropriate fallback.
export const GlassView = ({
  children,
  style,
  blurType,
  blurAmount = 1,
  fallbackColor,
}: GlassViewProps) => {
  const theme = useTheme();
  const defaultBlurType = ThemeManager.name === 'dark' ? 'dark' : 'xlight';

  if (Platform.OS === 'ios') {
    return (
      <BlurView blurType={blurType || defaultBlurType} blurAmount={blurAmount} style={style}>
        {children}
      </BlurView>
    );
  }

  const defaultFallback = ThemeManager.name === 'dark'
    ? theme.colors.blackTransparentDark
    : theme.colors.whiteTransparentDarker;

  return (
    <View style={[{ backgroundColor: fallbackColor || defaultFallback }, style]}>
      {children}
    </View>
  );
};
