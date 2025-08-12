import * as Yup from 'yup';
import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { NotesEditorResult } from 'components/NotesEditorScreen';
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
import formatcoords from 'formatcoords';
import { Formik, FormikProps } from 'formik';
import { useEvent } from 'lib/event';
import { useConfirmAction } from 'lib/useConfirmAction';
import { DateTime } from 'luxon';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BSON } from 'realm';
import { Location } from 'realmdb';
import { selectLocation } from 'store/selectors/locationSelectors';
import { saveCurrentLocation } from 'store/slices/location';
import { useTheme } from 'theme';
import { FilterType } from 'types/filter';
import { LocationNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  LocationNavigatorParamList,
  'LocationEditor'
>;

// Order of fields for accessory view.
enum Fields {
  name,
}

type FormValues = {
  name: string;
  notes: string;
};

const LocationEditorScreen = ({ navigation, route }: Props) => {
  const { locationId } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const dispatch = useDispatch();
  const realm = useRealm();

  const location = useObject(Location, new BSON.ObjectId(locationId));
  const currentLocationId = useSelector(selectLocation).locationId;

  const initialValues = {
    name: location?.name || '',
    notes: location?.notes || '',
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);

  const coords =
    location &&
    formatcoords(location?.coords.latitude, location?.coords.longitude)
      .format({
        latLonSeparator: '|',
      })
      .split('|');

  useEffect(() => {
    navigation.setOptions({
      title: location?.name,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.name]);

  useEffect(() => {
    event.on('location-notes', onChangeNotes);
    return () => {
      event.removeListener('location-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    Keyboard.dismiss();
    formikRef.current?.resetForm();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
  };

  const onSubmit = (values: FormValues) => {
    if (location) {
      realm.write(() => {
        location.updatedOn = DateTime.now().toISO();
        location.name = values.name || 'no-name';
        location.notes = values.notes;
      });
    }
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  const deleteLocation = () => {
    // If deleting the current location object then clear the current location.
    // Delete this before the location object to prevent referencing a deleted object.
    if (location?._id.toString() === currentLocationId) {
      dispatch(saveCurrentLocation({}));
    }

    realm.write(() => {
      realm.delete(location);
    });
    navigation.goBack();
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
        if (next.dirty) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={cancel}
            />
          );
        }
      },
      headerRight: () => {
        if (next.dirty) {
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
        }
      },
    });
  };

  return (
    <>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
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
              <Divider text={'LOCATION NAME'} />
              <ListItemInput
                ref={nameFieldRef}
                position={['first', 'last']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('name'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.name),
                  value: values.name,
                  placeholder: 'Location Name',
                  autoCapitalize: 'words',
                }}
              />
              <Divider text={'NOTES'} />
              <ListItemNotes
                notes={values.notes}
                position={['first', 'last']}
                onPress={() =>
                  navigation.navigate('NotesEditor', {
                    title: 'Location Notes',
                    text: values?.notes,
                    eventName: 'location-notes',
                  })
                }
              />
            </View>
          )}
        </Formik>
        <Divider text={'COORDINATES'} />
        <ListItem
          title={'Latitude'}
          position={['first']}
          value={coords ? coords[0] : ''}
        />
        <ListItem
          title={'Longitude'}
          position={['last']}
          value={coords ? coords[1] : ''}
        />
        <Divider text={'EVENTS'} />
        <ListItem
          title={'Last On'}
          position={['first']}
          value={'Nov 4, 2023 at 11:49PM'}
        />
        <ListItem
          title={'Events'}
          position={['last']}
          rightContent={'chevron-right'}
          onPress={() =>
            navigation.navigate('Events', {
              filterType: FilterType.BypassFilter,
              locationId: location?._id.toString(),
            })
          }
        />
        <Divider />
        <Button
          title={'Delete Location'}
          titleStyle={theme.styles.buttonAssertiveTitle}
          buttonStyle={theme.styles.buttonAssertive}
          containerStyle={theme.styles.buttonContainer}
          outline
          onPress={() => {
            confirmAction(
              {
                label: 'Delete Location',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this location?',
              },
              deleteLocation,
            );
          }}
        />
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

export default LocationEditorScreen;
