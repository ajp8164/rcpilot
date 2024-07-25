import { makeStyles } from '@rneui/themed';
import React from 'react';
import { View } from 'react-native';
import { AppTheme, useTheme } from 'theme';

export const ModalHandle = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  return <View style={s.view} />;
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  view: {
    height: 7,
  },
}));

export default ModalHandle;
