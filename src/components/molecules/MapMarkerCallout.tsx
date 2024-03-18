import { AppTheme, useTheme } from 'theme';

import React from 'react';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

interface MapMarkerCalloutInterface {
  children: ReactNode;
}

export const MapMarkerCallout = ({ children }: MapMarkerCalloutInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <>
      <View style={s.bubble}>{children}</View>
      <View style={s.arrow} />
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  bubble: {
    backgroundColor: theme.colors.whiteTransparentDark,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  arrow: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderStyle: 'solid',
    borderLeftColor: theme.colors.transparent,
    borderRightColor: theme.colors.transparent,
    borderBottomColor: theme.colors.whiteTransparentDark,
    backgroundColor: theme.colors.transparent,
    transform: [{ rotate: '180deg' }],
  },
}));
