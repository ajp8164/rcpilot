import { Divider, ListItem } from '@react-native-ajp-elements/ui';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewModelNavigatorParamList } from 'types/navigation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<NewModelNavigatorParamList, 'ScanCodeSize'>;

const ScanCodeSizeScreen = () => {
  const theme = useTheme();

  const scanCodeSizes = [
    { name: 'Large' },
    { name: 'Small' },
    { name: 'None' },
  ];

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {scanCodeSizes.map((size, index) => {
        return (
          <ListItem
            key={index}
            title={size.name}
            position={scanCodeSizes.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === scanCodeSizes.length - 1 ? ['last'] : []}
            rightImage={false}
            onPress={() => null}
          />)
      })}
    </SafeAreaView>
  );
};

export default ScanCodeSizeScreen;
