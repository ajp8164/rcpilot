import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
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
import { ModelFuel } from 'realmdb/ModelFuel';
import {
  NewModelFuelNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import { NotesEditorResult } from 'types/notes';
import * as Yup from 'yup';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelFuelEditor'>,
  NativeStackScreenProps<NewModelFuelNavigatorParamList, 'NewModelFuel'>
>;

// Order of fields for accessory view.
enum Fields {
  name,
  cost,
}

type FormValues = {
  name: string;
  cost: string;
  notes: string;
};

const ModelFuelEditorScreen = ({ navigation, route }: Props) => {
  const { modelFuelId } = route.params || {};
  const theme = useTheme();
  const event = useEvent();

  const realm = useRealm();
  const modelFuel = useObject(ModelFuel, new BSON.ObjectId(modelFuelId));

  const initialValues = {
    name: modelFuel?.name || '',
    cost: modelFuel?.cost?.toFixed(2) || '',
    notes: modelFuel?.notes || '',
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    cost: Yup.string(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);
  const costFieldRef = useRef<ListItemInputMethods>(null);

  useEffect(() => {
    event.on('fuel-notes', onChangeNotes);
    return () => {
      event.removeListener('fuel-notes', onChangeNotes);
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
    if (modelFuel) {
      realm.write(() => {
        modelFuel.updatedOn = now;
        modelFuel.name = values.name || 'no-name';
        modelFuel.cost = values.cost ? parseFloat(values.cost) : undefined;
        modelFuel.notes = values.notes;
      });
    } else {
      realm.write(() => {
        realm.create('ModelFuel', {
          createdOn: now,
          updatedOn: now,
          name: values.name,
          cost: values.cost ? parseFloat(values.cost) : undefined,
          notes: values.notes,
        });
      });
    }
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
                  label: 'Fuel Name',
                  placeholder: 'Fuel Name',
                  autoCapitalize: 'words',
                }}
              />
              <Divider />
              <ListItemInput
                ref={costFieldRef}
                position={['first', 'last']}
                title={'Fuel Cost'}
                units={'per gal'}
                container={'right'}
                error={!!errors.cost}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: (_, unformatted) =>
                    handleChange('cost')(unformatted),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.cost),
                  value: values.cost,
                  placeholder: '$0.00',
                  mask: Masks.CURRENCY,
                  rtlNumber: true,
                  keyboardType: 'number-pad',
                }}
              />
              <Divider text={'NOTES'} />
              <ListItemNotes
                notes={values.notes}
                position={['first', 'last']}
                onPress={() =>
                  navigation.navigate('NotesEditor', {
                    title: 'Fuel Notes',
                    text: values.notes,
                    eventName: 'fuel-notes',
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
        fieldRefs={[nameFieldRef.current, costFieldRef.current]}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

export default ModelFuelEditorScreen;
