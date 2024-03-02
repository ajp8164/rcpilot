import { ActivityIndicator, LayoutChangeEvent, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { viewport } from '@react-native-ajp-elements/ui';

interface EmptyViewInterface {
  error?: boolean;
  info?: boolean;
  message?: string;
  details?: string;
  isLoading?: boolean;
}

export const EmptyView = ({
  info,
  error,
  message = 'Nothing here!',
  details,
  isLoading,
}: EmptyViewInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const tabBar = useBottomTabBarHeight();
  const bottom = viewport.height * 0.6 - tabBar;
  const [height, setHeight] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={s.container}>
      <View style={[s.items, {bottom: bottom - height}]} onLayout={onLayout}>
        {isLoading ?
          <ActivityIndicator size={'large'} color={theme.colors.midGray} style={{height: 45}} />
        :
          <Icon
            name={error ? 'triangle-exclamation' : info ? 'circle-info' : 'magnifying-glass'}
            size={45}
            color={theme.colors.midGray}
          />
        }
        <Text style={s.message}>{message}</Text>
        <Text style={s.details}>{details}</Text>
      </View>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  items: {
    position: 'absolute',
    alignItems: 'center',
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
