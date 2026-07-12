import React from 'react';
import { View } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { LiquidGlassButton } from '../LiquidGlassButton';

interface GlassBackButtonProps {
  onPress?: () => void;
}

// A self-positioning glass back button overlay for screens with hidden headers.
// Absolutely positioned at the top-left, respecting safe area insets.
export const GlassBackButton = ({ onPress }: GlassBackButtonProps) => {
  const theme = useTheme();
  const s = useStyles();
  const navigation = useNavigation();

  return (
    <View style={s.container}>
      <LiquidGlassButton onPress={onPress || (() => navigation.goBack())}>
        <ChevronLeft
          size={33}
          color={theme.colors.screenHeaderButtonText}
          style={s.icon}
        />
      </LiquidGlassButton>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device }) => ({
  container: {
    position: 'absolute',
    top: device.insets.top - 1,
    left: 16,
  },
  icon: {
    left: -1,
  },
}));
