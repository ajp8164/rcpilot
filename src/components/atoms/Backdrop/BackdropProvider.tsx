import React, { ReactNode, useState } from 'react';
import { View } from 'react-native';

import { ThemeManager } from '@react-native-hello/ui';

import { BackdropContext } from './BackdropContext';

export const BackdropProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const s = useStyles();

  const [enabled, setEnabled] = useState(false);

  return (
    <BackdropContext.Provider
      value={{
        enabled,
        setEnabled,
      }}>
      <View style={enabled ? s.enabled : s.disabled}>{children}</View>
    </BackdropContext.Provider>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  disabled: {
    width: '100%',
    height: '100%',
  },
  enabled: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
}));
