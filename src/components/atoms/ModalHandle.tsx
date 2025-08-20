import React from 'react';
import { View } from 'react-native';

import { ThemeManager } from '@react-native-hello/ui';

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
