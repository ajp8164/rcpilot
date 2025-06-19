import { View } from 'react-native';
import { BackdropContext } from './BackdropContext';
import React, { ReactNode, useState } from 'react';
import { makeStyles } from '@rn-vui/themed';
import { AppTheme, useTheme } from 'theme';

export const BackdropProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const theme = useTheme();
  const s = useStyles(theme);

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

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
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
