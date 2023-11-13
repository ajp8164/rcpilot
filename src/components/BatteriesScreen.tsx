import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'theme';

const BatteriesScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[theme.styles.view, { paddingHorizontal: 0 }]}
    />
  );
};

export default BatteriesScreen;
