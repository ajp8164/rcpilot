import { AppTheme, useTheme } from 'theme';
import { Checklist, ChecklistAction, ChecklistActionHistoryEntry, JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { ListItem, ListItemCheckboxInfo, ListItemInput, SectionListHeader, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';
import { SectionList, SectionListData, SectionListRenderItem } from 'react-native';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { ChecklistType } from 'types/checklist';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { actionScheduleState } from 'lib/checklist';
import { groupItems } from 'lib/sectionList';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
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
  const event = useEvent();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));

  const checklists = useRef(model?.checklists.filter(c => {
    return c.type === ChecklistType.Maintenance;
  })).current;

  const actionsToDo = useRef(groupChecklistActions(checklists || []));
  const [selectedMaintenanceActions, setSelectedMaintenanceActions] = useState<string[]>([]);

  // Used to force a render since notes state changes are immediatley pushed to realm.
  const [render, setRender] = useState(false);

  // History captures the current date, the model time before the event, and the
  // event number at which the checklist action is performed.
  const [newChecklistActionHistoryEntry] = useState<JChecklistActionHistoryEntry>({
    refId: '',
    date: DateTime.now().toISO()!,
    modelTime: model ? model.totalTime : 0,
    eventNumber: model ? model.totalEvents + 1 : 0,
  });

  useEffect(() => {
    const onPerform = () => {
      // Write a history entry for each pending action.
      realm.write(() => {
        actionsToDo.current.forEach(section => {
          selectedMaintenanceActions.forEach(actionRefId => {
            const actionItem = section.data.find(item => item.action.refId === actionRefId);
            if (actionItem) {
              // Note: write the history entry before updating the schedule.
              actionItem.action.history.push({
                ...newChecklistActionHistoryEntry,
                refId: uuidv4(), // Create a unique reference
              } as ChecklistActionHistoryEntry);

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
    };

    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            title={'Perform'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            disabled={selectedMaintenanceActions.length === 0}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            onPress={() => {
              onPerform();
              navigation.goBack();
            }}
          />
        )
      },
    });
  }, [ selectedMaintenanceActions ]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('maintenance-notes', onChangeNotes);

    return () => {
      event.removeListener('maintenance-notes', onChangeNotes);
    };
  }, []);
  
  const onChangeCost = (value: number, action: ChecklistAction) => {
    realm.write(() => {
      action.cost = value;
    });
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    // Set the notes on the correct action using the data passed through the notes editor.
    const actionRefId = result.extraData;
    realm.write(() => {
      actionsToDo.current.forEach(section => {
        const actionItem = section.data.find(item => item.action.refId === actionRefId);
        if (actionItem) {
          actionItem.action.notes = result.text;
          setRender(!render);
        }
      });
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
        if (a.schedule.state.due.now) {
          actionItemData.push({
            checklist: c,
            action: a,
          });
        }
      });  
    });

    return groupItems<ChecklistActionItemData, Section>(actionItemData, (actionItem) => {
      return actionItem.checklist.name.toUpperCase();
    });
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
    return (
      <ListItemCheckboxInfo
        key={actionItem.action.refId}
        title={actionItem.action.description}
        subtitle={actionItem.action.schedule.state.text}
        iconChecked={'square-check'}
        iconUnchecked={'square'}
        iconSize={26}
        iconColor={theme.colors.screenHeaderButtonText}
        checked={isExpanded}
        position={!isExpanded ? listItemPosition(index, section.data.length) : index === 0 ? ['first'] : []}
        onPress={() => {
          togglePendMaintenanceItem(actionItem.action.refId);
        }}
        onPressInfo={() => navigation.navigate('ModelMaintenanceItem', {
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
       /> 
    );
  };

  return (
    <SectionList
      contentContainerStyle={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={actionsToDo.current}
      keyExtractor={(item, index)=> `${index}${item.action.refId}`}
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
              checklistType: ChecklistType.Maintenance,
              eventName: 'model-maintenance-one-time',
            }
          })}
        />
      </>
      }
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  add: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderButtonText,
  },
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelMaintenanceScreen;
