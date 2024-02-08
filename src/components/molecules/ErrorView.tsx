import { AppTheme, useTheme } from 'theme';
import { Text, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import React from 'react';
import { makeStyles } from '@rneui/themed';
import { viewport } from '@react-native-ajp-elements/ui';

interface ErrorViewInterface {
  message?: string;
}

export const ErrorView = ({
  message = 'Error!',
}: ErrorViewInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <View style={s.container}>
    <Icon
      name={'triangle-exclamation'}
      size={45}
      color={theme.colors.midGray}
    />
    <Text style={s.message}>{message}</Text>
  </View>
);
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
    paddingTop: viewport.height / 2 - 100,
    alignItems: 'center',    
  },
  message: {
    marginTop: 10,
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  }
}));
