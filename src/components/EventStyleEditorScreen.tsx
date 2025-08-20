import React, { useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { Formik, FormikProps } from 'formik';
import { BSON } from 'realm';
import { EventStyle } from 'realmdb/EventStyle';
import { SetupNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

// CompositeScreenProps not working here since NewEventStyle is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  | NativeStackScreenProps<SetupNavigatorParamList, 'EventStyleEditor'>
  | NativeStackScreenProps<SetupNavigatorParamList, 'NewEventStyle'>;

// Order of fields for accessory view.
enum Fields {
  name,
}

type FormValues = {
  name: string;
};

const EventStyleEditorScreen = ({ navigation, route }: Props) => {
  const { eventStyleId } = route.params || {};

  const theme = useTheme();
  const realm = useRealm();
  const eventStyle = useObject(EventStyle, new BSON.ObjectId(eventStyleId));

  const initialValues = {
    name: eventStyle?.name,
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);

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
    if (eventStyle) {
      realm.write(() => {
        eventStyle.name = values.name || 'no-name';
      });
    } else {
      realm.write(() => {
        realm.create('EventStyle', {
          name: values.name,
        });
      });
    }
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
        <Divider />
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
          {({ handleChange, values }) => (
            <View>
              <FormikStateWatcher<FormValues>
                onChange={onFormikWatcherStateChange}
              />
              <ListItemInput
                ref={nameFieldRef}
                position={['first', 'last']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('name'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.name),
                  value: values.name,
                  placeholder: 'Style Name',
                  autoCapitalize: 'words',
                }}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={[nameFieldRef.current]}
        doneText={'Save'}
        disabledDone={!formikCanSubmit}
        onDone={save}
      />
    </>
  );
};

export default EventStyleEditorScreen;
