import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import { Divider, ListItem, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemNotes } from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import { Formik, FormikProps } from 'formik';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { ChecklistAction } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'types/notes';
import * as Yup from 'yup';

type FormValues = {
  notes: string;
};

export type Props = NativeStackScreenProps<
  EventSequenceNavigatorParamList,
  'EventSequenceChecklistItem'
>;

const EventSequenceChecklistItemScreen = ({ navigation, route }: Props) => {
  const { checklistRefId, actionRefId } = route.params;

  const theme = useTheme();
  const event = useEvent();
  const realm = useRealm();

  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(
    Model,
    new BSON.ObjectId(currentEventSequence.modelId),
  );
  const checklist = useRef(
    model?.checklists.find(c => c.refId === checklistRefId),
  ).current;
  const action = useRef(
    checklist?.actions.find(a => a.refId === actionRefId),
  ).current;

  const initialValues = {
    notes: action?.notes || '',
  } as FormValues;

  const schema = Yup.object().shape({
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);

  useEffect(() => {
    event.on('event-checklist-item-notes', onChangeNotes);
    return () => {
      event.removeListener('event-checklist-item-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: FormValues) => {
    if (action) {
      realm.write(() => {
        action.notes = values.notes;
      });
    }
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  const lastTimePerformed = (action: ChecklistAction) => {
    if (action.history.length) {
      return DateTime.fromISO(
        action.history[action.history.length - 1].date,
      ).toFormat('MMM d, yyyy');
    }
    return 'never';
  };

  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;

    // Auto submit the form when updating an existing model.
    if (canSubmit) {
      formikRef.current?.handleSubmit();
    }
  };

  if (!action) {
    return <EmptyView error message={'Checklist Action Not Found!'} />;
  }

  return (
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
        {({ values }) => (
          <View>
            <FormikStateWatcher<FormValues>
              onChange={onFormikWatcherStateChange}
            />
            <Divider text={'ACTION'} />
            <ListItem
              title={action?.description}
              subtitle={`From checklist '${checklist?.name}'`}
              position={['first', 'last']}
            />
            <Divider text={'FREQUENCY'} />
            <ListItem
              title={action.schedule.state.text}
              subtitle={`Last time was ${lastTimePerformed(action)}`}
              position={['first', 'last']}
            />
            <Divider text={'NOTES'} />
            <ListItemNotes
              notes={values.notes || 'Notes'}
              position={['first', 'last']}
              onPress={() =>
                navigation.navigate('NotesEditor', {
                  title: 'Action Notes',
                  text: values.notes,
                  headerButtonStyle: {
                    color: theme.colors.stickyWhite,
                  },
                  eventName: 'event-checklist-item-notes',
                })
              }
            />
          </View>
        )}
      </Formik>
    </View>
  );
};

export default EventSequenceChecklistItemScreen;
