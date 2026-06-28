import React from 'react';
import { Platform, View, type ViewStyle } from 'react-native';

import { BlurView, type BlurViewProps } from '@react-native-community/blur';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  // iOS blur type. Ignored on Android.
  blurType?: BlurViewProps['blurType'];
  // Android fallback background color.
  fallbackColor?: string;
}

// Renders a BlurView on iOS for glass/frosted effects, and a semi-transparent
// solid View on Android as a Material-appropriate fallback.
export const GlassView = ({
  children,
  style,
  blurType = 'xlight',
  fallbackColor = 'rgba(255, 255, 255, 0.85)',
}: GlassViewProps) => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView blurType={blurType} blurAmount={1} style={style}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[{ backgroundColor: fallbackColor }, style]}>
      {children}
    </View>
  );
};
