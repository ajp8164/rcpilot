import React, { useEffect, useRef } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { ChecklistAction } from 'realmdb/Checklist';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import { ListItem } from 'components/atoms/List';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { View } from 'react-native';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { useEvent } from 'lib/event';
import { useSelector } from 'react-redux';
import { useTheme } from 'theme';

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

  useEffect(() => {
    event.on('event-checklist-item-notes', onChangeNotes);
    return () => {
      event.removeListener('event-checklist-item-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
  };

  const lastTimePerformed = (action: ChecklistAction) => {
    if (action.history.length) {
      return DateTime.fromISO(
        action.history[action.history.length - 1].date,
      ).toFormat('MMM d, yyyy');
    }
    return 'never';
  };

  const setNotes = (text: string) => {
    if (action) {
      realm.write(() => {
        action.notes = text;
      });
    }
  };

  if (!action) {
    return <EmptyView error message={'Checklist Action Not Found!'} />;
  }

  return (
    <View style={theme.styles.view}>
      <Divider text={'ACTION'} />
      <ListItem
        title={action?.description}
        subtitle={`From checklist '${checklist?.name}'`}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'FREQUENCY'} />
      <ListItem
        title={action.schedule.state.text}
        subtitle={`Last time was ${lastTimePerformed(action)}`}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'NOTES'} />
      <ListItem
        title={action.notes || 'Notes'}
        position={['first', 'last']}
        onPress={() =>
          navigation.navigate('NotesEditor', {
            text: action.notes,
            headerButtonStyle: {
              color: theme.colors.screenHeaderInvButtonText,
            },
            eventName: 'event-checklist-item-notes',
          })
        }
      />
    </View>
  );
};

export default EventSequenceChecklistItemScreen;
