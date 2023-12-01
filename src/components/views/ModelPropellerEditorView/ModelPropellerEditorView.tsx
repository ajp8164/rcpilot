import {ListItem, ListItemInput} from 'components/atoms/List';
import { ModelPropeller, ModelPropellerUnits } from 'types/model';
import { ModelPropellerEditorViewMethods, ModelPropellerEditorViewProps } from './types';

import { Divider } from '@react-native-ajp-elements/ui';
import { MeasurementUnits } from 'types/common';
import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useSetState } from '@react-native-ajp-elements/core';

type ModelPropellerEditorView = ModelPropellerEditorViewMethods;

const ModelPropellerEditorView = (props: ModelPropellerEditorViewProps) => {
  const { modelPropellerId } = props;

  const navigation = useNavigation<any>();

  const mockModelPropeller: ModelPropeller = {
    id: modelPropellerId || '-1',
    name: 'One',
    vendor: '',
    diameter: 0,
    pitch: 0,
    measuredUnits: ModelPropellerUnits.Inches,
    notes: ''
  };

  const [modelPropeller, setModelPropeller] = useSetState<ModelPropeller>(mockModelPropeller);

  return (
    <View>
      <Divider />
      <ListItemInput
        value={mockModelPropeller.name}
        placeholder={'Unnamed Propeller'}
        position={['first', 'last']}
        onChangeText={() => null}
      /> 
      <Divider />
      <ListItemInput
        value={mockModelPropeller.name}
        placeholder={'Unnamed Vendor'}
        position={['first']}
        onChangeText={() => null}
      /> 
      <ListItemInput
        title={'Number of Blades'}
        value={'Unknown'}
        keyboardType={'number-pad'}
        onChangeText={() => null}
      />
      <ListItemInput
        title={'Diameter'}
        label={'in'}
        value={'Unknown'}
        keyboardType={'number-pad'}
        onChangeText={() => null}
      />
      <ListItemInput
        title={'Pitch'}
        label={'in'}
        value={'Unknown'}
        keyboardType={'number-pad'}
        position={['first']}
        onChangeText={() => null}
      />
      <Divider />
      <ListItem
        title={'Measurement Units'}
        value={'Inches'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Measurement Units',
          values: Object.values(MeasurementUnits),
          selected: 'None',
          eventName: 'scan-code-size',
        })}
        /> 
      <Divider text={'NOTES'} />
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('Notes', {
          title: 'Propeller Notes',
        })}
      />
    </View>
  );
};

export default ModelPropellerEditorView;
