import React from 'react';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { GlassView } from 'components/atoms/GlassView';
import { X } from 'lucide-react-native';

export const IconCloseX = () => {
  const theme = useTheme();
  const s = useStyles();

  return (
    <GlassView style={s.container}>
      <X color={theme.colors.midGray} size={18} strokeWidth={3} />
    </GlassView>
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
