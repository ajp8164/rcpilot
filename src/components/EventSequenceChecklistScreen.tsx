import React, { useEffect, useRef, useState } from 'react';
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject } from '@realm/react';
import ActionBar from 'components/atoms/ActionBar';
import { Button } from 'components/atoms/Button';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import { eventKind } from 'lib/modelEvent';
import { groupItems } from 'lib/sectionList';
import { useConfirmAction } from 'lib/useConfirmAction';
import { uuidv4 } from 'lib/utils';
import { ChevronRight } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import {
  Checklist,
  ChecklistAction,
  JChecklistActionHistoryEntry,
} from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { eventSequence } from 'store/slices/eventSequence';
import { ChecklistType } from 'types/checklist';
import { EventSequenceNavigatorParamList } from 'types/navigation';

type ChecklistActionItemData = {
  checklist: Checklist;
  action: ChecklistAction;
};
type Section = {
  title?: string;
  data: ChecklistActionItemData[];
};

export type Props = NativeStackScreenProps<
  EventSequenceNavigatorParamList,
  'EventSequenceChecklist'
>;

const EventSequenceChecklistScreen = ({ navigation, route }: Props) => {
  const { cancelable, checklistType } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();

  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(
    Model,
    new BSON.ObjectId(currentEventSequence.modelId),
  );
  const [kind] = useState(eventKind(model?.type));

  const checklists = useRef(
    model?.checklists.filter(c => {
      return c.type === checklistType;
    }),
  ).current;

  const actionsToDo = useRef(groupChecklistActions(checklists || []));

  // History captures the current date, the model time before the event, and the
  // event number at which the checklist action is performed.
  const [newChecklistActionHistoryEntry] =
    useState<JChecklistActionHistoryEntry>({
      refId: '',
      date: DateTime.now().toISO(),
      modelTime: model ? model.statistics.totalTime : 0,
      eventNumber: model ? model.statistics.totalEvents : 0,
    });

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (cancelable) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={{
                ...theme.styles.buttonScreenHeaderTitle,
                ...s.buttonScreenHeaderTitleLeft,
              }}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={() =>
                confirmAction(
                  {
                    label: `Do Not Log ${kind.name}`,
                    title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
                  },
                  cancelEvent,
                )
              }
            />
          );
        }
      },
      headerRight: () => {
        return (
          <Button
            title={checklistType === ChecklistType.PreEvent ? 'Timer' : 'Log'}
            titleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              ...s.buttonScreenHeaderTitleRight,
            }}
            buttonStyle={theme.styles.buttonScreenHeader}
            iconRight
            icon={
              <ChevronRight
                color={theme.colors.stickyWhite}
                size={33}
                style={{ right: 10 }}
              />
            }
            onPress={() => {
              if (checklistType === ChecklistType.PreEvent) {
                navigation.navigate('EventSequenceTimer', {});
              } else {
                navigation.navigate('EventSequenceNewEventEditor');
              }
            }}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.getParent()?.goBack();
  };

  function groupChecklistActions(
    checklists: Checklist[],
  ): SectionListData<ChecklistActionItemData, Section>[] {
    const actionItemData: ChecklistActionItemData[] = [];
    let actions: ChecklistAction[] = [];

    checklists.forEach(c => {
      actions = c.actions.filter(a => a.schedule.state.due.now);
      actions.forEach(a => {
        actionItemData.push({
          checklist: c,
          action: a,
        });
      });
    });

    return groupItems<ChecklistActionItemData, Section>(
      actionItemData,
      actionItem => {
        return actionItem.checklist.name.toUpperCase();
      },
    );
  }

  const allActionsComplete = () => {
    const entries = Object.keys(
      currentEventSequence.checklistActionHistoryEntries[checklistType],
    );
    if (!entries.length) return false;
    return entries.every(
      key =>
        !!currentEventSequence.checklistActionHistoryEntries[checklistType][key]
          ?.date,
    );
  };

  const someActionsComplete = () => {
    return Object.keys(currentEventSequence.checklistActionHistoryEntries).some(
      key =>
        !!currentEventSequence.checklistActionHistoryEntries[checklistType][key]
          ?.date,
    );
  };

  const completeAllActions = () => {
    actionsToDo.current.forEach(section => {
      section.data.forEach(actionItem => {
        const action = actionItem.action;
        if (
          !currentEventSequence.checklistActionHistoryEntries[checklistType][
            action.refId
          ]?.date
        ) {
          dispatch(
            eventSequence.setChecklistActionComplete({
              checklistActionRefId: action.refId,
              checklistActionHistoryEntry: {
                ...newChecklistActionHistoryEntry,
                refId: uuidv4(), // Create a unique reference
              },
              checklistType,
            }),
          );
        }
      });
    });
  };

  const pendAllActions = () => {
    Object.keys(
      currentEventSequence.checklistActionHistoryEntries[checklistType],
    ).forEach(key => {
      if (
        currentEventSequence.checklistActionHistoryEntries[checklistType][key]
          .date
      ) {
        dispatch(
          eventSequence.setChecklistActionNotComplete({
            checklistActionRefId: key,
            checklistType,
          }),
        );
      }
    });
  };

  const renderChecklistAction: SectionListRenderItem<
    ChecklistActionItemData,
    Section
  > = ({
    item: actionItem,
    section,
    index,
  }: {
    item: ChecklistActionItemData;
    section: Section;
    index: number;
  }) => {
    return (
      <ListItemCheckBoxInfo
        key={actionItem.action.refId}
        title={actionItem.action.description}
        subtitle={actionItem.action.schedule.state.text}
        position={listItemPosition(index, section.data.length)}
        checkBox
        checked={
          !!currentEventSequence.checklistActionHistoryEntries[checklistType][
            actionItem.action.refId
          ]?.date
        }
        onPress={() => {
          if (
            currentEventSequence.checklistActionHistoryEntries[checklistType][
              actionItem.action.refId
            ]?.date
          ) {
            dispatch(
              eventSequence.setChecklistActionNotComplete({
                checklistActionRefId: actionItem.action.refId,
                checklistType,
              }),
            );
          } else {
            dispatch(
              eventSequence.setChecklistActionComplete({
                checklistActionRefId: actionItem.action.refId,
                checklistActionHistoryEntry: {
                  ...newChecklistActionHistoryEntry,
                  refId: uuidv4(), // Create a unique reference
                },
                checklistType,
              }),
            );
          }
        }}
        onPressInfo={() =>
          navigation.navigate('EventSequenceChecklistItem', {
            checklistRefId: actionItem.checklist.refId,
            actionRefId: actionItem.action.refId,
          })
        }
      />
    );
  };

  if (!actionsToDo.current.length) {
    return <EmptyView info message={'No Checklist Actions Pending'} />;
  }

  const allComplete = allActionsComplete();
  const someComplete = someActionsComplete();

  return (
    <View style={theme.styles.view}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={[theme.styles.view, s.sectionList]}
        sections={actionsToDo.current}
        keyExtractor={(item, index) => `${index}${item.action.refId}`}
        renderItem={renderChecklistAction}
        renderSectionHeader={({ section: { title } }) => (
          <View style={theme.styles.listSectionHeader}>
            <Divider text={title} />
          </View>
        )}
        ListFooterComponent={<Divider />}
      />
      <ActionBar
        actions={[
          {
            label: 'Uncheck All Items',
            visible: someComplete || allComplete,
            onPress: pendAllActions,
          },
          {
            label: 'Check All Items',
            visible: !allComplete || (someComplete && !allComplete),
            onPress: completeAllActions,
          },
        ]}
      />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  buttonScreenHeaderTitleLeft: {
    color: theme.colors.stickyWhite,
  },
  buttonScreenHeaderTitleRight: {
    right: 10,
    color: theme.colors.stickyWhite,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default EventSequenceChecklistScreen;
