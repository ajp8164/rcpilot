import { AppTheme, useTheme } from 'theme';
import {
  Checklist,
  ChecklistAction,
  ChecklistActionHistoryEntry,
  JChecklistAction,
  JChecklistActionHistoryEntry
} from 'realmdb/Checklist';
import { ChecklistActionScheduleType, ChecklistType } from 'types/checklist';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import {
  ListItem,
  ListItemCheckboxInfo,
  ListItemInput,
  SectionListHeader,
  listItemPosition,
  swipeableDeleteItem
} from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { SectionList, SectionListData, SectionListRenderItem } from 'react-native';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { DateTime } from 'luxon';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { actionScheduleState } from 'lib/checklist';
import { groupItems } from 'lib/sectionList';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { modelCostStatistics } from 'lib/analytics';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useEvent } from 'lib/event';
import { uuidv4 } from 'lib/utils';

type ChecklistActionItemData = {checklist: Checklist, action: ChecklistAction};
type Section = {
  title?: string;
  data: ChecklistActionItemData[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelMaintenance'>;

const ModelMaintenanceScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));

  const actionsToDo = refreshActionsToDo();
  const [selectedMaintenanceActions, setSelectedMaintenanceActions] = useState<string[]>([]);

  // History captures the current date, the model time before the event, and the
  // event number at which the checklist action is performed.
  const [newChecklistActionHistoryEntry] = useState<JChecklistActionHistoryEntry>({
    refId: '',
    date: DateTime.now().toISO()!,
    modelTime: model ? model.statistics.totalTime : 0,
    eventNumber: model ? model.statistics.totalEvents : 0,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            title={'Perform'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabled={selectedMaintenanceActions.length === 0}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            onPress={onPerform}
          />
        )
      },
    });
  }, [ selectedMaintenanceActions ]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('maintenance-notes', onChangeNotes);
    event.on('model-maintenance-one-time', onAddOneTimeAction);

    return () => {
      event.removeListener('maintenance-notes', onChangeNotes);
      event.removeListener('model-maintenance-one-time', onAddOneTimeAction);
      
    };
  }, [ actionsToDo ]);

  const onPerform = () => {
    // Write a history entry for each pending action.
    realm.write(() => {
      actionsToDo.forEach(section => {
        selectedMaintenanceActions.forEach(actionRefId => {
          const actionItem = section.data.find(item => item.action.refId === actionRefId);
          if (actionItem) {
            // Note: write the history entry before updating the schedule.
            actionItem.action.history.push({
              ...newChecklistActionHistoryEntry,
              cost: actionItem.action.cost,
              refId: uuidv4(), // Create a unique reference
            } as ChecklistActionHistoryEntry);

            // Update the model with maintenance cost change.
            model!.statistics = lodash.merge(
              model!.statistics,
              modelCostStatistics(model!, {newValue: actionItem.action.cost})
            );

            // Update the action schedule state.
            actionItem.action.schedule.state = actionScheduleState(
              actionItem.action,
              actionItem.checklist.type,
              model!,
            );
          }
        });
      });
    });
    // Completed all selected actions; reset.
    setSelectedMaintenanceActions([]);
  };

  const onChangeCost = (value: number, action: ChecklistAction) => {
    // The action will always have the last updated cost (even though the actual cost
    // is stored with the history entry).
    realm.write(() => {
      action.cost = value;
    });
  };

  function refreshActionsToDo() {
    const c = model?.checklists.filter(c => {
      return c.type === ChecklistType.Maintenance || c.type === ChecklistType.OneTimeMaintenance;
    })
    return groupChecklistActions(c || []);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    // Set the notes on the correct action using the data passed through the notes editor.
    const actionRefId = result.extraData;
    realm.write(() => {
      actionsToDo.forEach(section => {
        const actionItem = section.data.find(item => item.action.refId === actionRefId);
        if (actionItem) {
          actionItem.action.notes = result.text;
        }
      });
    });
  };

  const onAddOneTimeAction = (action: JChecklistAction) => {
    // Assign a refId to the action.
    action.refId = uuidv4();

    const oneTimeChecklist = model?.checklists.find(c => c.type === ChecklistType.OneTimeMaintenance);

    if (!oneTimeChecklist) {
      // Lazily create the only one-time maintenance checklist for the model.
      // Insert the action at the same time.
      realm.write(() => {
        const newModelChecklist = {
          refId: uuidv4(),
          name: 'One-Time Maintenance',
          type: ChecklistType.OneTimeMaintenance,
          actions: [action],
        } as Checklist;

        model!.checklists.push(newModelChecklist);
      });
    } else {
      // Add the action to the models one-time maintenance checklist.
      realm.write(() => {
        oneTimeChecklist.actions.push(action as ChecklistAction);
      });      
    }
  };

  const deleteAction = (actionItem: ChecklistActionItemData) => {
    realm.write(() => {
      const index = actionItem.checklist.actions.findIndex(a => a.refId === actionItem.action.refId);
      actionItem.checklist.actions.splice(index, 1);
    });
  };

  const togglePendMaintenanceItem = (actionRefId: string) => {
    if (selectedMaintenanceActions.includes(actionRefId)) {
      const actions = ([] as string[]).concat(selectedMaintenanceActions);
      lodash.remove(actions, refId => refId === actionRefId);
      setSelectedMaintenanceActions(actions);
    } else {
      setSelectedMaintenanceActions(selectedMaintenanceActions.concat(actionRefId));
    }
  };

  function groupChecklistActions(checklists: Checklist[]): SectionListData<ChecklistActionItemData, Section>[] {
    let actionItemData: ChecklistActionItemData[] = [];
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

    return groupItems<ChecklistActionItemData, Section>(actionItemData, (actionItem) => {
      return actionItem.checklist.name.toUpperCase();
    });
  };

  const actionSwipeable = (actionItem: ChecklistActionItemData) => {
    return {
      rightItems: [{
        ...swipeableDeleteItem[theme.mode],
        onPress: () => {
          confirmAction(deleteAction, {
            label: 'Delete Maintenance Action',
            title: 'This action cannot be undone.\nAre you sure you want to delete this maintenance action?',
            value: actionItem,
          });
        }
      }]
    }
  };

  const renderChecklistAction: SectionListRenderItem<ChecklistActionItemData, Section> = ({
    item: actionItem,
    section,
    index,
  }: {
    item: ChecklistActionItemData;
    section: Section;
    index: number;
  }) => {
    const isExpanded = selectedMaintenanceActions.includes(actionItem.action.refId);
    const isLastInList = index === section.data.length - 1;

    // Cannot delete repeating actions.
    const swipeable = actionItem.action.schedule.type === ChecklistActionScheduleType.NonRepeating
      ? actionSwipeable(actionItem)
      : {};

    return (
      <ListItemCheckboxInfo
        ref={ref => ref && listEditor.add(ref, 'maintenance-actions', actionItem.action.refId)}
        key={actionItem.action.refId}
        title={actionItem.action.description}
        titleNumberOfLines={1}
        subtitle={actionItem.action.schedule.state.text}
        iconChecked={'square-check'}
        iconUnchecked={'square'}
        iconSize={26}
        iconColor={theme.colors.clearButtonText}
        checked={isExpanded}
        position={!isExpanded ? listItemPosition(index, section.data.length) : index === 0 ? ['first'] : []}
        onPress={() => {
          togglePendMaintenanceItem(actionItem.action.refId);
        }}
        onPressInfo={() => navigation.navigate('ModelMaintenanceAction', {
          modelId,
          checklistRefId: actionItem.checklist.refId,
          actionRefId: actionItem.action.refId,
        })}
        expanded={isExpanded}
        ExpandableComponent={
          <>
            <ListItemInput
              title={'Total Costs'}
              value={`${actionItem.action.cost || 0}`}
              numeric={true}
              numericProps={{maxValue: 99999}}
              keyboardType={'number-pad'}
              placeholder={'Unknown'}
              onChangeText={value => onChangeCost(parseFloat(value), actionItem.action)}
              /> 
            <ListItem
              title={actionItem.action.notes || 'No notes'}
              position={isExpanded && isLastInList ? ['last'] : []}
              onPress={() => navigation.navigate('NotesEditor', {
                title: 'Maintenance Notes',
                text: actionItem.action.notes,
                extraData: actionItem.action.refId,
                eventName: 'maintenance-notes',
              })}
            />
          </>
        }
        swipeable={swipeable}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('maintenance-actions', actionItem.action.refId)}
        onSwipeableWillClose={listEditor.onItemWillClose}
       /> 
    );
  };

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={actionsToDo}
      keyExtractor={item => item.action.refId}
      renderItem={renderChecklistAction}
      renderSectionHeader={({section: {title}}) => (
        <SectionListHeader title={title} />
      )}
      ListFooterComponent={
        <>
        <Divider />
        <ListItem
          title={'Add One-Time Maintenance'}
          titleStyle={s.add}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => navigation.navigate('NewChecklistActionNavigator', {
            screen: 'NewChecklistAction',
            params: {
              modelId,
              checklistType: ChecklistType.OneTimeMaintenance,
              eventName: 'model-maintenance-one-time',
            }
          })}
        />
        <Divider />
      </>
      }
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  add: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelMaintenanceScreen;
