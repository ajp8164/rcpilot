import React, { useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';

import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRealm } from '@realm/react';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { Formik, FormikProps } from 'formik';
import { Check, X } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { SetupNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'NewCommander'
>;

// Order of fields for accessory view.
enum Fields {
  name,
}

type FormValues = {
  name: string;
};

const NewCommanderScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  const realm = useRealm();

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);

  const initialValues = {
    name: '',
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const cancel = () => {
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
    realm.write(() => {
      realm.create('Commander', {
        createdOn: now,
        updatedOn: now,
        name: values.name,
      });
    });
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

    navigation.setOptions(
      headerOptions({
        left: [<HeaderIconButton Icon={X} onPress={cancel} />],
        right: [
          <HeaderIconButton
            Icon={Check}
            disabled={!canSubmit}
            onPress={save}
          />,
        ],
      }),
    );
  };

  return (
    <>
      <View style={theme.styles.view}>
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
              <Divider />
              <ListItemInput
                ref={nameFieldRef}
                position={['first', 'last']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('name'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.name),
                  value: values.name,
                  label: 'Commander Name',
                  placeholder: 'Commander Name',
                  autoCapitalize: 'words',
                }}
              />
            </View>
          )}
        </Formik>
      </View>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={[nameFieldRef.current]}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

export default NewCommanderScreen;
