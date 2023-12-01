import {ListItem, ListItemInput} from 'components/atoms/List';
import { ModelFuelEditorViewMethods, ModelFuelEditorViewProps } from './types';

import { Divider } from '@react-native-ajp-elements/ui';
import { ModelFuel } from 'types/model';
import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useSetState } from '@react-native-ajp-elements/core';

type ModelFuelEditorView = ModelFuelEditorViewMethods;

const ModelFuelEditorView = (props: ModelFuelEditorViewProps) => {
  const { modelFuelId } = props;

  const navigation = useNavigation<any>();

  const mockModelFuel: ModelFuel = {
    id: modelFuelId || '-1',
    name: 'High  Octane',
    cost: 0,
    notes: ''
  };

  const [modelFuel, setModelFuel] = useSetState<ModelFuel>(mockModelFuel);

  return (
    <View>
      <Divider text={'DETAILS'} />
      <ListItemInput
        value={mockModelFuel.name}
        placeholder={'Name for the category'}
        position={['first', 'last']}
        onChangeText={() => null}
      /> 
      <Divider />
      <ListItemInput
        title={'Fuel Cost'}
        label={'per gal'}
        value={'Amount'}
        keyboardType={'number-pad'}
        position={['first', 'last']}
      />
      <Divider text={'NOTES'} />
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('Notes', {
          title: 'Fuel Notes',
        })}
      />
    </View>
  );
};

export default ModelFuelEditorView;
