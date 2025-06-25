import { ListItem, ListItemInput } from 'components/atoms/List';
import { MeasurementUnits, MeasurementUnitsAbbr } from 'types/common';
import {
  NewModelPropellerNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { ScrollView } from 'react-native';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelPropellerEditor'>,
  NativeStackScreenProps<
    NewModelPropellerNavigatorParamList,
    'NewModelPropeller'
  >
>;

const ModelPropellerEditorScreen = ({ navigation, route }: Props) => {
  const { modelPropellerId } = route.params || {};
  const theme = useTheme();
  const event = useEvent();
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const modelPropeller = useObject(
    ModelPropeller,
    new BSON.ObjectId(modelPropellerId),
  );

  const name = useRef(modelPropeller?.name || undefined);
  const vendor = useRef(modelPropeller?.vendor || undefined);
  const numberOfBlades = useRef(
    modelPropeller?.numberOfBlades?.toString() || undefined,
  );
  const diameter = useRef(modelPropeller?.diameter?.toString() || undefined);
  const pitch = useRef(modelPropeller?.pitch?.toString() || undefined);
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnits>(
    modelPropeller?.measurementUnits || MeasurementUnits.Inches,
  );
  const [notes, setNotes] = useState(modelPropeller?.notes || undefined);

  useEffect(() => {
    const canSave =
      !!name.current &&
      (!eqString(modelPropeller?.name, name.current) ||
        !eqString(modelPropeller?.vendor, vendor.current) ||
        !eqNumber(modelPropeller?.numberOfBlades, numberOfBlades.current) ||
        !eqNumber(modelPropeller?.diameter, diameter.current) ||
        !eqNumber(modelPropeller?.pitch, pitch.current) ||
        !eqString(modelPropeller?.measurementUnits, measurementUnits) ||
        !eqString(modelPropeller?.notes, notes));

    const save = () => {
      if (modelPropeller) {
        realm.write(() => {
          modelPropeller.updatedOn = DateTime.now().toISO();
          modelPropeller.name = name.current || 'no-name';
          modelPropeller.vendor = vendor.current;
          modelPropeller.numberOfBlades = toNumber(numberOfBlades.current);
          modelPropeller.diameter = toNumber(diameter.current);
          modelPropeller.pitch = toNumber(pitch.current);
          modelPropeller.measurementUnits = measurementUnits;
          modelPropeller.notes = notes;
        });
      } else {
        realm.write(() => {
          const now = DateTime.now().toISO();
          realm.create('ModelPropeller', {
            createdOn: now,
            updatedOn: now,
            name: name.current,
            vendor: vendor.current,
            numberOfBlades: toNumber(numberOfBlades.current),
            diameter: toNumber(diameter.current),
            pitch: toNumber(pitch.current),
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

    setScreenEditHeader({ enabled: canSave, action: onDone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name.current,
    vendor.current,
    diameter.current,
    pitch.current,
    measurementUnits,
    numberOfBlades.current,
    notes,
  ]);

  useEffect(() => {
    event.on('propeller-measurement-units', onChangeMeasurementUnits);
    event.on('propeller-notes', onChangeNotes);
    return () => {
      event.removeListener(
        'propeller-measurement-units',
        onChangeMeasurementUnits,
      );
      event.removeListener('propeller-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeMeasurementUnits = (result: EnumPickerResult) => {
    setMeasurementUnits(result.value[0] as MeasurementUnits);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItemInput
        value={name.current}
        placeholder={'Unnamed Propeller'}
        position={['first', 'last']}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
      <Divider />
      <ListItemInput
        value={vendor.current}
        placeholder={'Unnamed Vendor'}
        position={['first']}
        onChangeText={value => setDebounced(() => (vendor.current = value))}
      />
      <ListItemInput
        title={'Number of Blades'}
        value={numberOfBlades.current}
        placeholder={'Unknown'}
        numeric={true}
        numericProps={{ prefix: '', precision: 0 }}
        keyboardType={'number-pad'}
        onChangeText={value =>
          setDebounced(() => (numberOfBlades.current = value))
        }
      />
      <ListItemInput
        title={'Diameter'}
        label={MeasurementUnitsAbbr[measurementUnits]}
        value={diameter.current}
        placeholder={'Unknown'}
        numeric={true}
        numericProps={{ prefix: '' }}
        keyboardType={'number-pad'}
        onChangeText={value => setDebounced(() => (diameter.current = value))}
      />
      <ListItemInput
        title={'Pitch'}
        label={MeasurementUnitsAbbr[measurementUnits]}
        value={pitch.current}
        placeholder={'Unknown'}
        numeric={true}
        numericProps={{ prefix: '' }}
        keyboardType={'number-pad'}
        position={['last']}
        onChangeText={value => setDebounced(() => (pitch.current = value))}
      />
      <Divider />
      <ListItem
        title={'Measurement Units'}
        value={measurementUnits}
        position={['first', 'last']}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Measurement Units',
            headerBackTitle: modelPropeller ? 'Propeller' : 'New Prop',
            values: Object.values(MeasurementUnits),
            selected: measurementUnits,
            eventName: 'propeller-measurement-units',
          })
        }
      />
      <Divider text={'NOTES'} />
      <ListItem
        title={notes || 'Notes'}
        position={['first', 'last']}
        onPress={() =>
          navigation.navigate('NotesEditor', {
            title: 'Propeller Notes',
            text: notes,
            eventName: 'propeller-notes',
          })
        }
      />
    </ScrollView>
  );
};

export default ModelPropellerEditorScreen;
