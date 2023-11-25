import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckbox } from 'components/atoms/List';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { modelTypes } from 'lib/model';
import { useTheme } from 'theme';

const ModelTypeScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {modelTypes.map((type, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={type.name}
            position={modelTypes.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === modelTypes.length - 1 ? ['last'] : []}
            checked={index === 0}
            onPress={() => null}
          />)
      })}
    </SafeAreaView>
  );
};

export default ModelTypeScreen;
