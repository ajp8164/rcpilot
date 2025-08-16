import { ThemeManager } from '@react-native-hello/ui';
import React from 'react';
import { View } from 'react-native';

export const ModalHandle = () => {
  const s = useStyles();

  return <View style={s.view} />;
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  view: {
    height: 7,
  },
}));

export default ModalHandle;
