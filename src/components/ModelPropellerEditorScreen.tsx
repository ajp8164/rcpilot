import { ListItem, ListItemInput } from 'components/atoms/List';
import { MeasurementUnits, MeasurementUnitsAbbr } from 'types/common';
import { NewModelPropellerNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import React, { useEffect, useState } from 'react';
import { eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelPropellerEditor'>,
  NativeStackScreenProps<NewModelPropellerNavigatorParamList, 'NewModelPropeller'>
>;

const ModelPropellerEditorScreen = ({ navigation, route }: Props) => {
  const { modelPropellerId } = route.params || {};
  const theme = useTheme();
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const modelPropeller = useObject(ModelPropeller, new BSON.ObjectId(modelPropellerId));

  const [name, setName] = useState(modelPropeller?.name || undefined);
  const [vendor, setVendor] = useState(modelPropeller?.vendor || undefined);
  const [numberOfBlades, setNumberOfBlades] = useState(modelPropeller?.numberOfBlades?.toString() || undefined);
  const [diameter, setDiameter] = useState(modelPropeller?.diameter?.toString() || undefined);
  const [pitch, setPitch] = useState(modelPropeller?.pitch?.toString() || undefined);
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnits>(modelPropeller?.measurementUnits || MeasurementUnits.Inches);
  const [notes, setNotes] = useState(modelPropeller?.notes || undefined);

  useEffect(() => {
    const canSave = !!name && (
      !eqString(modelPropeller?.name, name) ||
      !eqString(modelPropeller?.vendor, vendor) ||
      !eqNumber(modelPropeller?.numberOfBlades, numberOfBlades) ||
      !eqNumber(modelPropeller?.diameter, diameter) ||
      !eqNumber(modelPropeller?.pitch, pitch) ||
      !eqString(modelPropeller?.measurementUnits, measurementUnits) ||
      !eqString(modelPropeller?.notes, notes)
    );

    const save = () => {
      if (modelPropeller) {
        realm.write(() => {
          modelPropeller.updatedOn = DateTime.now().toISO()!,
          modelPropeller.name = name!;
          modelPropeller.vendor = vendor;
          modelPropeller.numberOfBlades = toNumber(numberOfBlades);
          modelPropeller.diameter = toNumber(diameter);
          modelPropeller.pitch = toNumber(pitch);
          modelPropeller.measurementUnits = measurementUnits;
          modelPropeller.notes = notes;
        });
      } else {
        realm.write(() => {
          const now = DateTime.now().toISO()!;
          realm.create('ModelPropeller', {
            createdOn: now,
            updatedOn: now,
            name,
            vendor,
            numberOfBlades: toNumber(numberOfBlades),
            diameter: toNumber(diameter),
            pitch: toNumber(pitch),
            measurementUnits,
            notes,
          });
        });
      }
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({enabled: canSave, action: onDone});
  }, [name, vendor, diameter, pitch, measurementUnits, numberOfBlades, notes]);

  useEffect(() => {
    event.on('propeller-notes', setNotes);
    event.on('propeller-measurement-units', onChangeMeasurementUnits);
    return () => {
      event.removeListener('propeller-notes', setNotes);
      event.removeListener('propeller-measurement-units', onChangeMeasurementUnits);
    };
  }, []);

  const onChangeMeasurementUnits = (result: EnumPickerResult) => {
    setMeasurementUnits(result.value[0] as MeasurementUnits);
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
        <ListItemInput
          value={name}
          placeholder={'Unnamed Propeller'}
          position={['first', 'last']}
          onChangeText={setName}
        /> 
        <Divider />
        <ListItemInput
          value={vendor}
          placeholder={'Unnamed Vendor'}
          position={['first']}
          onChangeText={setVendor}
        /> 
        <ListItemInput
          title={'Number of Blades'}
          value={numberOfBlades}
          placeholder={'Unknown'}
          numeric={true}
          numericProps={{prefix: '', precision: 0}}
          keyboardType={'number-pad'}
          onChangeText={setNumberOfBlades}
        />
        <ListItemInput
          title={'Diameter'}
          label={MeasurementUnitsAbbr[measurementUnits]}
          value={diameter}
          placeholder={'Unknown'}
          numeric={true}
          numericProps={{prefix: ''}}
          keyboardType={'number-pad'}
          onChangeText={setDiameter}
        />
        <ListItemInput
          title={'Pitch'}
          label={MeasurementUnitsAbbr[measurementUnits]}
          value={pitch}
          placeholder={'Unknown'}
          numeric={true}
          numericProps={{prefix: ''}}
          keyboardType={'number-pad'}
          position={['last']}
          onChangeText={setPitch}
        />
        <Divider />
        <ListItem
          title={'Measurement Units'}
          value={measurementUnits}
          position={['first', 'last']}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Measurement Units',
            headerBackTitle: modelPropeller ? 'Propeller' : 'New Prop',
            values: Object.values(MeasurementUnits),
            selected: measurementUnits,
            eventName: 'propeller-measurement-units',
          })}
          /> 
        <Divider text={'NOTES'} />
        <ListItem
          title={notes || 'Notes'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('Notes', {
            title: 'Propeller Notes',
            text: notes,
            eventName: 'propeller-notes',
          })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModelPropellerEditorScreen;
