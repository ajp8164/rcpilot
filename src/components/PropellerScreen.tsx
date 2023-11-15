import { Divider, ListItem } from '@react-native-ajp-elements/ui';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewModelNavigatorParamList } from 'types/navigation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<NewModelNavigatorParamList, 'Propeller'>;

const PropellerScreen = () => {
  const theme = useTheme();

  const propellers = [
    { name: 'None' },
  ];

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {propellers.map((category, index) => {
        return (
          <ListItem
            key={index}
            title={category.name}
            position={propellers.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === propellers.length - 1 ? ['last'] : []}
            rightImage={false}
            onPress={() => null}
          />)
      })}
      <Divider text={'You can manage propellers through the Globals sexction in the Setup tab.'} />
    </SafeAreaView>
  );
};

export default PropellerScreen;
