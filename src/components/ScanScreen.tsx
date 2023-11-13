import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScannerView } from '@react-native-ajp-elements/ui';
import { useTheme } from 'theme';

const ScanScreen = () => {
  const theme = useTheme();

  const onScan = (data: string) => {
    console.log(`scan data ${data}`);
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[theme.styles.view, { paddingHorizontal: 0 }]}
    >
      <ScannerView onScan={onScan}/>
    </SafeAreaView>
  );
};

export default ScanScreen;
