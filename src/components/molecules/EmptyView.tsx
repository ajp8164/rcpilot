import { AppTheme, useTheme } from 'theme';
import { Text, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import React from 'react';
import { makeStyles } from '@rneui/themed';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { viewport } from '@react-native-ajp-elements/ui';

interface EmptyViewInterface {
  error?: boolean;
  info?: boolean;
  message?: string;
  details?: string;
}

export const EmptyView = ({
  info,
  error,
  message = 'Nothing here!',
  details,
}: EmptyViewInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const header = useHeaderHeight();
  const tabBar = useBottomTabBarHeight();
  const top = (viewport.height - theme.insets.top - header - tabBar) / 3;
  
  return (
    <View style={[s.container, {paddingTop: top}]}>
    <Icon
      name={error ? 'triangle-exclamation' : info ? 'circle-info' : 'magnifying-glass'}
      size={45}
      color={theme.colors.midGray}
    />
    <Text style={s.message}>{message}</Text>
    <Text style={s.details}>{details}</Text>
  </View>
);
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  message: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
    ...theme.styles.textBold,
    marginTop: 10,
    textAlign: 'center',
  },
  details: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
    marginTop: 10,
    textAlign: 'center',
  },
}));
