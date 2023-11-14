import { Divider, ListItem } from '@react-native-ajp-elements/ui';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewModelNavigatorParamList } from 'types/navigation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<NewModelNavigatorParamList, 'ModelType'>;

const modelTypes = [
  { name: 'Airplane', icon: '' },
  { name: 'Sailplane', icon: '' },
  { name: 'Helicopter', icon: '' },
  { name: 'Multicopter', icon: '' },
  { name: 'Car', icon: '' },
  { name: 'Boat', icon: '' },
  { name: 'Robot', icon: '' },
];

const ModelTypeScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[theme.styles.view, { paddingHorizontal: 0 }]}>
      <Divider />
      {modelTypes.map((type, index) => {
        return (
          <ListItem
            key={index}
            title={type.name}
            position={index === 0 ? ['first'] : index === modelTypes.length - 1 ? ['last'] : []}
            rightImage={false}
            onPress={() => null}
          />)
      })}
    </SafeAreaView>
  );
};

export default ModelTypeScreen;
