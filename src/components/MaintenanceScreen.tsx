import React, { useEffect, useRef, useState } from 'react';
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import {
  ListItemCheckBoxInfo,
  ListItemInput,
  ListItemNotes,
} from 'components/atoms/List';
import { HeaderButton, headerOptions } from 'components/atoms/navigation';
import { modelCostStatistics } from 'lib/analytics';
import { actionScheduleState } from 'lib/checklist';
import { Masks } from 'lib/inputMasks';
import { groupItems } from 'lib/sectionList';
import { useConfirmAction } from 'lib/useConfirmAction';
import { uuidv4 } from 'lib/utils';
import lodash from 'lodash';
import { Trash2 } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import {
  Checklist,
  ChecklistAction,
  ChecklistActionHistoryEntry,
  JChecklistAction,
  JChecklistActionHistoryEntry,
} from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { ChecklistActionScheduleType, ChecklistType } from 'types/checklist';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'types/notes';

type ChecklistActionItemData = {
  checklist: Checklist;
  action: ChecklistAction;
};
type Section = {
  title?: string;
  data: ChecklistActionItemData[];
};

export type Props = NativeStackScreenProps<
  ModelsNavigatorParamList,
  'Maintenance'
>;

const MaintenanceScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));

  const actionsToDo = refreshActionsToDo();
  const [selectedMaintenanceActions, setSelectedMaintenanceActions] = useState<
    string[]
  >([]);

  // History captures the current date, the model time before the event, and the
  // event number at which the checklist action is performed.
  const [newChecklistActionHistoryEntry] =
    useState<JChecklistActionHistoryEntry>({
      refId: '',
      date: DateTime.now().toISO(),
      modelTime: model ? model.statistics.totalTime : 0,
      eventNumber: model ? model.statistics.totalEvents : 0,
    });

  const listEditorRef = useRef<ListEditorMethods>(null);

  useEffect(() => {
    navigation.setOptions(
      headerOptions({
        right: [
          <HeaderButton
            label={'Perform'}
            disabled={selectedMaintenanceActions.length === 0}
            onPress={onPerform}
          />,
        ],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaintenanceActions]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('maintenance-notes', onChangeNotes);
    event.on('model-maintenance-one-time', onAddOneTimeAction);

    return () => {
      event.removeListener('maintenance-notes', onChangeNotes);
      event.removeListener('model-maintenance-one-time', onAddOneTimeAction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsToDo]);

  const onPerform = () => {
    // Write a history entry for each pending action.
    if (model) {
      realm.write(() => {
        actionsToDo.forEach(section => {
          selectedMaintenanceActions.forEach(actionRefId => {
            const actionItem = section.data.find(
              item => item.action.refId === actionRefId,
            );
            if (actionItem) {
              // Note: write the history entry before updating the schedule.
              actionItem.action.history.push({
                ...newChecklistActionHistoryEntry,
                cost: actionItem.action.cost,
                refId: uuidv4(), // Create a unique reference
              } as ChecklistActionHistoryEntry);

              // Update the model with maintenance cost change.
              model.statistics = lodash.merge(
                model.statistics,
                modelCostStatistics(model, {
                  newValue: actionItem.action.cost,
                }),
              );

              // Update the action schedule state.
              actionItem.action.schedule.state = actionScheduleState(
                actionItem.action,
                actionItem.checklist.type,
                model,
              );
            }
          });
        });
      });
    }
    // Completed all selected actions; reset.
    setSelectedMaintenanceActions([]);
  };

  const onChangeCost = (action: ChecklistAction, value: string) => {
    // The action will always have the last updated cost (even though the actual cost
    // is stored with the history entry).
    realm.write(() => {
      action.cost = parseFloat(value);
    });
  };

  function refreshActionsToDo() {
    const c = model?.checklists.filter(c => {
      return (
        c.type === ChecklistType.Maintenance ||
        c.type === ChecklistType.OneTimeMaintenance
      );
    });
    return groupChecklistActions(c || []);
  }

  const onChangeNotes = (result: NotesEditorResult) => {
    // Set the notes on the correct action using the data passed through the notes editor.
    const actionRefId = result.extraData;
    realm.write(() => {
      actionsToDo.forEach(section => {
        const actionItem = section.data.find(
          item => item.action.refId === actionRefId,
        );
        if (actionItem) {
          actionItem.action.notes = result.text;
        }
      });
    });
  };

  const onAddOneTimeAction = (action: JChecklistAction) => {
    // Assign a refId to the action.
    action.refId = uuidv4();

    const oneTimeChecklist = model?.checklists.find(
      c => c.type === ChecklistType.OneTimeMaintenance,
    );

    if (!oneTimeChecklist) {
      // Lazily create the only one-time maintenance checklist for the model.
      // Insert the action at the same time.
      if (model) {
        realm.write(() => {
          const newModelChecklist = {
            refId: uuidv4(),
            name: 'One-Time Maintenance',
            type: ChecklistType.OneTimeMaintenance,
            actions: [action],
          } as Checklist;

          model.checklists.push(newModelChecklist);
        });
      }
    } else {
      // Add the action to the models one-time maintenance checklist.
      realm.write(() => {
        oneTimeChecklist.actions.push(action as ChecklistAction);
      });
    }
  };

  const deleteAction = (actionItem: ChecklistActionItemData) => {
    realm.write(() => {
      const index = actionItem.checklist.actions.findIndex(
        a => a.refId === actionItem.action.refId,
      );
      actionItem.checklist.actions.splice(index, 1);
    });
  };

  const togglePendMaintenanceItem = (actionRefId: string) => {
    if (selectedMaintenanceActions.includes(actionRefId)) {
      const actions = ([] as string[]).concat(selectedMaintenanceActions);
      lodash.remove(actions as never, refId => refId === actionRefId);
      setSelectedMaintenanceActions(actions);
    } else {
      setSelectedMaintenanceActions(
        selectedMaintenanceActions.concat(actionRefId),
      );
    }
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
    const isExpanded = selectedMaintenanceActions.includes(
      actionItem.action.refId,
    );
    const isLastInList = index === section.data.length - 1;

    // Cannot delete repeating actions.
    const allowDelete =
      actionItem.action.schedule.type ===
      ChecklistActionScheduleType.NonRepeating;

    return (
      <ListItemCheckBoxInfo
        key={actionItem.action.refId}
        title={actionItem.action.description}
        subtitle={actionItem.action.schedule.state.text}
        position={
          !isExpanded
            ? listItemPosition(index, section.data.length)
            : index === 0
              ? ['first']
              : []
        }
        checkBox
        checked={isExpanded}
        listEditor={listEditorRef.current}
        onPress={() => {
          togglePendMaintenanceItem(actionItem.action.refId);
        }}
        onPressInfo={() =>
          navigation.navigate('MaintenanceAction', {
            modelId,
            checklistRefId: actionItem.checklist.refId,
            actionRefId: actionItem.action.refId,
          })
        }
        swipeableActionsRight={
          allowDelete
            ? [
                {
                  text: 'Delete',
                  color: theme.colors.assertive,
                  ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
                  op: 'remove',
                  confirmation: () => {
                    listEditorRef.current?.reset();
                    return confirmAction({
                      label: 'Delete Maintenance Action',
                      title:
                        'This action cannot be undone.\nAre you sure you want to delete this maintenance action?',
                    });
                  },
                  onPress: () => deleteAction(actionItem),
                },
              ]
            : undefined
        }
        expanded={isExpanded}
        ExpandableComponent={
          <>
            <ListItemInput
              title={'Total Costs'}
              container={'right'}
              inputProps={{
                inputAccessoryViewID: 'keyboardAccessory',
                onChangeText: (_, unformatted) =>
                  onChangeCost(actionItem.action, unformatted),
                value: `${actionItem.action.cost || 0}`,
                placeholder: '$0.00',
                mask: Masks.CURRENCY,
                rtlNumber: true,
                keyboardType: 'number-pad',
              }}
            />
            <ListItemNotes
              notes={actionItem.action.notes}
              position={isExpanded && isLastInList ? ['last'] : []}
              onPress={() =>
                navigation.navigate('NotesEditor', {
                  title: 'Maintenance Notes',
                  text: actionItem.action.notes,
                  eventName: 'maintenance-notes',
                })
              }
            />
          </>
        }
      />
    );
  };

  return (
    <ListEditor ref={listEditorRef}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={[theme.styles.view, s.sectionList]}
        sections={actionsToDo}
        keyExtractor={item => item.action.refId}
        renderItem={renderChecklistAction}
        renderSectionHeader={({ section: { title } }) => (
          <View style={theme.styles.listSectionHeader}>
            <Divider text={title} />
          </View>
        )}
        ListFooterComponent={
          <>
            <Divider />
            <Button
              title={'Add One-Time Maintenance'}
              titleStyle={theme.styles.buttonOutlineAssertiveTitle}
              buttonStyle={theme.styles.buttonOutlineAssertive}
              containerStyle={theme.styles.buttonContainer}
              outline
              onPress={() =>
                navigation.navigate('NewChecklistActionNavigator', {
                  screen: 'NewChecklistAction',
                  params: {
                    modelId,
                    checklistType: ChecklistType.OneTimeMaintenance,
                    eventName: 'model-maintenance-one-time',
                  },
                })
              }
            />
            <Divider />
          </>
        }
      />
    </ListEditor>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default MaintenanceScreen;
