import { AppTheme, useTheme } from 'theme';
import { Checklist, ChecklistAction } from 'realmdb/Checklist';
import { ChecklistActionSchedulePeriod, ChecklistActionScheduleType, ChecklistType } from 'types/checklist';
import { ListItemCheckboxInfo, SectionListHeader, listItemPosition } from 'components/atoms/List';
import { ListRenderItem, SectionList, SectionListData, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ActionBar from 'components/atoms/ActionBar';
import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { actionScheduleSummary } from 'lib/checklist';
import { eventKind } from 'lib/event';
import { eventSequence } from 'store/slices/eventSequence';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useObject } from '@realm/react';

type ChecklistActionItemData = {checklist: Checklist, action: ChecklistAction};
type Section = {
  title?: string;
  data: ChecklistActionItemData[];
};

export type Props = NativeStackScreenProps<EventSequenceNavigatorParamList, 'EventSequenceChecklist'>;

const EventSequenceChecklistScreen = ({ navigation, route }: Props) => {
  const { cancelable, checklistType } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();

  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(Model, new BSON.ObjectId(currentEventSequence.modelId));
  const [kind] = useState(eventKind(model?.type));

  const actionsToDo = useRef<ChecklistAction[]>([]);
  const actionDate = useRef(DateTime.now().toISO()!).current;
  const checklists = useRef(model?.checklists.filter(c => {
    return c.type === checklistType;
  })).current;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (cancelable) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonInvScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonInvScreenHeader, s.headerButton]}
              onPressIn={() => confirmAction(cancelEvent, {
                label: `Do Not Log ${kind.name}`,
                title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
              })}
            />
          )
        }
      },
      headerRight: () => {
        return (
          <Button
            title={checklistType === ChecklistType.PreEvent ? 'Timer' : 'Log'}
            titleStyle={theme.styles.buttonInvScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonInvScreenHeader, s.headerButton]}
            iconRight={true}
            icon={
              <Icon
                name={'chevron-right'}
                color={theme.colors.stickyWhite}
                size={22}
                style={s.headerIcon}
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
        )
      },
    });
  }, []);
  
  useEffect(() => {
    // Intialize action history entries.
    actionsToDo.current.forEach(a => {
      dispatch(eventSequence.addChecklistActionHistoryEntry({
        checklistActionRefId: a.refId,
        checklistActionHistortEntry: {
          date: actionDate,
          complete: false
        },
      }));
    })
  }, []);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.getParent()?.goBack();
  };

  const groupChecklistActions = (checklists: Checklist[]): SectionListData<ChecklistActionItemData, Section>[] => {
    let actionItemData: ChecklistActionItemData[] = [];
    let actions: ChecklistAction[] = [];

    checklists.forEach(c => {
      actions = c.actions.filter(a => {
        return a.schedule.type === ChecklistActionScheduleType.Repeating &&
          a.schedule.period === ChecklistActionSchedulePeriod.Events &&
          a.schedule.value === 1;
      });

      actions.forEach(a => {
        actionItemData.push({
          checklist: c,
          action: a,
        });
      });  
    });

    actionsToDo.current = actions;
    return groupItems<ChecklistActionItemData, Section>(actionItemData, (actionItem) => {
      return actionItem.checklist.name.toUpperCase();
    });
  };

  const allActionsComplete = () => {
    return Object.keys(currentEventSequence.checklistActionHistoryEntries).every(key =>
      currentEventSequence.checklistActionHistoryEntries[key].complete
    );
  };

  const someActionsComplete = () => {
    return Object.keys(currentEventSequence.checklistActionHistoryEntries).some(key =>
      currentEventSequence.checklistActionHistoryEntries[key].complete
    );
  };

  const completeAllActions = () => {
    Object.keys(currentEventSequence.checklistActionHistoryEntries).forEach(key => {
      if (!currentEventSequence.checklistActionHistoryEntries[key].complete) {
        dispatch(eventSequence.toggleChecklistActionComplete({
          checklistActionRefId: key,
        }))
        }
      }
    );
  };

  const pendAllActions = () => {
    Object.keys(currentEventSequence.checklistActionHistoryEntries).forEach(key => {
      if (currentEventSequence.checklistActionHistoryEntries[key].complete) {
        dispatch(eventSequence.toggleChecklistActionComplete({
          checklistActionRefId: key,
        }))
        }
      }
    );
  };

  const renderChecklistAction: ListRenderItem<ChecklistActionItemData> = ({ item: actionItem, index }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={actionItem.action.description}
        subtitle={actionScheduleSummary(actionItem.action, checklistType as ChecklistType)}
        iconChecked={'square-check'}
        iconUnchecked={'square'}
        iconSize={26}
        iconColor={theme.colors.screenHeaderButtonText}
        checked={currentEventSequence.checklistActionHistoryEntries[actionItem.action.refId]?.complete}
        position={listItemPosition(index, actionsToDo.current.length)}
        onPress={() =>
          dispatch(eventSequence.toggleChecklistActionComplete({
            checklistActionRefId: actionItem.action.refId,
          }))
        }
        onPressInfo={() => navigation.navigate('EventSequenceChecklistItem', {
          checklistRefId: actionItem.checklist.refId,
          actionRefId: actionItem.action.refId,
        })}
       /> 
    );
  };

  if (!checklists?.length) {
    return (
      <EmptyView info message={'No Checklists Pending'} />
    );    
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
        sections={groupChecklistActions(checklists)}
        keyExtractor={(item, index)=> `${index}${item.action.refId}`}
        renderItem={renderChecklistAction}
        renderSectionHeader={({section: {title}}) => (
          <SectionListHeader title={title} />
        )}
        ListFooterComponent={<Divider />}
      />
      <ActionBar
        actions={[
          {
            label: 'Uncheck All Items',
            visible: someComplete || allComplete,
            onPress: pendAllActions,
          }, {
            label: 'Check All Items',
            visible: !allComplete || (someComplete && !allComplete),
            onPress: completeAllActions,
          },
        ]}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
  headerIcon: {
    paddingLeft: 5
  },
}));

export default EventSequenceChecklistScreen;
