import React from 'react';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { BlurView } from '@react-native-community/blur';
import { X } from 'lucide-react-native';

export const IconCloseX = () => {
  const theme = useTheme();
  const s = useStyles();

  return (
    <BlurView blurType="ultraThinMaterial" style={s.container}>
      <X color={theme.colors.midGray} size={18} strokeWidth={3} />
    </BlurView>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default IconCloseX;
