import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import {
  ListItemInput,
  ListItemInputMethods,
  ListItemNotes,
} from 'components/atoms/List';
import { Formik, FormikProps } from 'formik';
import { Masks } from 'lib/inputMasks';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { MeasurementUnits, MeasurementUnitsAbbr } from 'types/common';
import {
  NewModelPropellerNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import { NotesEditorResult } from 'types/notes';
import * as Yup from 'yup';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelPropellerEditor'>,
  NativeStackScreenProps<
    NewModelPropellerNavigatorParamList,
    'NewModelPropeller'
  >
>;

// Order of fields for accessory view.
enum Fields {
  name,
  vendor,
  numberOfBlades,
  diameter,
  pitch,
}

type FormValues = {
  name: string;
  vendor: string;
  numberOfBlades: string;
  diameter: string;
  pitch: string;
  measurementUnits: MeasurementUnits;
  notes: string;
};

const ModelPropellerEditorScreen = ({ navigation, route }: Props) => {
  const { modelPropellerId } = route.params || {};
  const theme = useTheme();
  const event = useEvent();

  const realm = useRealm();
  const modelPropeller = useObject(
    ModelPropeller,
    new BSON.ObjectId(modelPropellerId),
  );

  const initialValues = {
    name: modelPropeller?.name || '',
    vendor: modelPropeller?.vendor || '',
    numberOfBlades: modelPropeller?.numberOfBlades?.toFixed() || '',
    diameter: modelPropeller?.diameter?.toFixed(2) || '',
    pitch: modelPropeller?.pitch?.toFixed(2) || '',
    measurementUnits:
      modelPropeller?.measurementUnits || MeasurementUnits.Inches,
    notes: modelPropeller?.notes || '',
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    vendor: Yup.string(),
    numberOfBlades: Yup.string().required(),
    diameter: Yup.string().required(),
    pitch: Yup.string().required(),
    measurementUnits: Yup.string().required(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);
  const vendorFieldRef = useRef<ListItemInputMethods>(null);
  const numberOfBladesFieldRef = useRef<ListItemInputMethods>(null);
  const diameterFieldRef = useRef<ListItemInputMethods>(null);
  const pitchFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        nameFieldRef.current,
        vendorFieldRef.current,
        numberOfBladesFieldRef.current,
        diameterFieldRef.current,
        pitchFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

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

  const cancel = () => {
    formikRef.current?.resetForm();
    Keyboard.dismiss();
    navigation.goBack();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = (values: FormValues) => {
    const now = DateTime.now().toISO();
    if (modelPropeller) {
      realm.write(() => {
        modelPropeller.updatedOn = now;
        modelPropeller.name = values.name || 'no-name';
        modelPropeller.vendor = values.vendor;
        modelPropeller.numberOfBlades = parseFloat(values.numberOfBlades);
        modelPropeller.diameter = parseFloat(values.diameter);
        modelPropeller.pitch = parseFloat(values.pitch);
        modelPropeller.measurementUnits = values.measurementUnits;
        modelPropeller.notes = values.notes;
      });
    } else {
      realm.write(() => {
        realm.create('ModelPropeller', {
          createdOn: now,
          updatedOn: now,
          name: values.name,
          vendor: values.vendor,
          numberOfBlades: parseFloat(values.numberOfBlades),
          diameter: parseFloat(values.diameter),
          pitch: parseFloat(values.pitch),
          measurementUnits: values.measurementUnits,
          notes: values.notes,
        });
      });
    }
  };

  const onChangeMeasurementUnits = (result: EnumPickerResult) => {
    formikRef.current?.setFieldValue('measurementUnits', result.value[0]);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, changedFields, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    // Update header as name changes.
    if (changedFields?.includes('name')) {
      navigation.setOptions({
        title: next?.values.name,
      });
    }

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={cancel}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            title={'Save'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={!canSubmit}
            onPress={save}
          />
        );
      },
    });
  };

  return (
    <>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'DETAILS'} />
        <Formik
          innerRef={formik => {
            if (formik) {
              formikRef.current = formik;
            }
          }}
          initialValues={initialValues}
          validationSchema={schema}
          validateOnMount
          onSubmit={onSubmit}>
          {({ errors, handleChange, values }) => (
            <View>
              <FormikStateWatcher<FormValues>
                onChange={onFormikWatcherStateChange}
              />
              <ListItemInput
                ref={nameFieldRef}
                position={['first', 'last']}
                error={!!errors.name}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('name'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.name),
                  value: values.name,
                  label: 'Propeller Name',
                  placeholder: 'Propeller Name',
                  autoCapitalize: 'words',
                }}
              />
              <Divider />
              <ListItemInput
                ref={vendorFieldRef}
                position={['first']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('vendor'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.vendor),
                  value: values.vendor,
                  label: 'Vendor',
                  placeholder: 'Vendor',
                  autoCapitalize: 'words',
                }}
              />
              <ListItemInput
                ref={numberOfBladesFieldRef}
                title={'Number of Blades'}
                error={!!errors.numberOfBlades}
                container={'right'}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: (_, unformatted) =>
                    handleChange('numberOfBlades')(unformatted),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(
                      Fields.numberOfBlades,
                    ),
                  value: values.numberOfBlades,
                  placeholder: 'Unknown',
                  mask: Masks.PROPELLER_BLADE_COUNT,
                  rtlNumber: true,
                  keyboardType: 'number-pad',
                }}
              />
              <ListItemInput
                ref={diameterFieldRef}
                title={'Diameter'}
                error={!!errors.diameter}
                units={
                  MeasurementUnitsAbbr[
                    values.measurementUnits as keyof typeof MeasurementUnitsAbbr
                  ]
                }
                container={'right'}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: (_, unformatted) =>
                    handleChange('diameter')(unformatted),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.diameter),
                  value: values.diameter,
                  placeholder: 'Unknown',
                  mask: Masks.PROPELLER_DIAMETER,
                  rtlNumber: true,
                  keyboardType: 'number-pad',
                }}
              />
              <ListItemInput
                ref={pitchFieldRef}
                title={'Pitch'}
                error={!!errors.pitch}
                units={
                  MeasurementUnitsAbbr[
                    values.measurementUnits as keyof typeof MeasurementUnitsAbbr
                  ]
                }
                container={'right'}
                position={['last']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: (_, unformatted) =>
                    handleChange('pitch')(unformatted),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.pitch),
                  value: values.pitch,
                  placeholder: 'Unknown',
                  mask: Masks.PROPELLER_PITCH,
                  rtlNumber: true,
                  keyboardType: 'number-pad',
                }}
              />
              <Divider />
              <ListItem
                title={'Measurement Units'}
                value={values.measurementUnits}
                position={['first', 'last']}
                rightContent={'chevron-right'}
                onPress={() =>
                  navigation.navigate('EnumPicker', {
                    title: 'Measurement Units',
                    headerBackTitle: modelPropeller ? 'Propeller' : 'New Prop',
                    values: Object.values(MeasurementUnits),
                    selected: values.measurementUnits,
                    eventName: 'propeller-measurement-units',
                  })
                }
              />
              <Divider text={'NOTES'} />
              <ListItemNotes
                notes={values.notes}
                position={['first', 'last']}
                onPress={() =>
                  navigation.navigate('NotesEditor', {
                    title: 'Propeller Notes',
                    text: values.notes,
                    eventName: 'propeller-notes',
                  })
                }
              />
            </View>
          )}
        </Formik>
      </ScrollView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={resolvedRefs}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

export default ModelPropellerEditorScreen;
