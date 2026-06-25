import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  ListItemInputMethods,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemNotes } from 'components/atoms/List';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import { Formik, FormikProps } from 'formik';
import { modelCostStatistics } from 'lib/analytics';
import { Masks } from 'lib/inputMasks';
import { eventKind } from 'lib/modelEvent';
import lodash from 'lodash';
import { Check, X } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'types/notes';
import * as Yup from 'yup';

// Order of fields for accessory view.
enum Fields {
  cost,
}

type FormValues = {
  cost: string;
  notes: string;
};

export type Props = NativeStackScreenProps<
  ModelsNavigatorParamList,
  'MaintenanceHistoryEntry'
>;

const MaintenanceHistoryEntryScreen = ({ navigation, route }: Props) => {
  const { modelId, checklistRefId, actionRefId, historyRefId } = route.params;

  const theme = useTheme();
  const event = useEvent();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const checklist = useRef(
    model?.checklists.find(c => c.refId === checklistRefId),
  ).current;
  const action = useRef(
    checklist?.actions.find(a => a.refId === actionRefId),
  ).current;
  const history = useRef(
    action?.history.find(h => h.refId === historyRefId),
  ).current;

  const initialValues = {
    cost: action?.cost?.toFixed(2) || '',
    notes: action?.notes || '',
  } as FormValues;

  const schema = Yup.object().shape({
    cost: Yup.string(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const costFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs([costFieldRef.current].filter(Boolean));
  }, []);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('maintenance-action-notes', onChangeNotes);

    return () => {
      event.removeListener('maintenance-action-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    Keyboard.dismiss();
    formikRef.current?.resetForm();
    navigation.goBack();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = (values: FormValues) => {
    if (model && history) {
      realm.write(() => {
        // Update the model with maintenance cost change.
        model.statistics = lodash.merge(
          model.statistics,
          modelCostStatistics(model, {
            oldValue: history.cost,
            newValue: values.cost ? parseFloat(values.cost) : undefined,
          }),
        );

        history.cost = values.cost ? parseFloat(values.cost) : undefined;
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
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

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

  if (!action || !history) {
    return <EmptyView error message={'Maintenance Action Not Found!'} />;
  }

  return (
    <>
      <AvoidSoftInputView style={[theme.styles.view]}>
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
              <Divider text={'COMPLETED MAINTENANCE'} />
              <ListItem
                title={action?.description}
                subtitle={`${DateTime.fromISO(history.date).toFormat("M/d/yyyy 'at' h:mm a")}, following ${eventKind(model?.type).name.toLowerCase()} #${history.eventNumber}`}
                position={['first', 'last']}
              />
              <Divider text={'MAINTENANCE COSTS'} />
              <ListItemInput
                ref={costFieldRef}
                title={'Total Cost'}
                error={!!errors.cost}
                position={['first', 'last']}
                container={'right'}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: (_, unformatted) =>
                    handleChange('cost')(unformatted),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.cost),
                  value: values.cost,
                  mask: Masks.CURRENCY,
                  rtlNumber: true,
                  placeholder: 'Unknown',
                  keyboardType: 'number-pad',
                }}
              />
              <Divider text={'NOTES'} />
              <ListItemNotes
                notes={values.notes}
                position={['first', 'last']}
                onPress={() =>
                  navigation.navigate('NotesEditor', {
                    title: 'Action Notes',
                    text: values.notes,
                    eventName: 'maintenance-action-notes',
                  })
                }
              />
            </View>
          )}
        </Formik>
      </AvoidSoftInputView>
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

export default MaintenanceHistoryEntryScreen;
