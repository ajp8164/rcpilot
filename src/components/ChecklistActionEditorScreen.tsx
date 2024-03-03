import {
  ChecklistActionNonRepeatingScheduleTimeframe,
  ChecklistActionScheduleFollowing,
  ChecklistActionSchedulePeriod,
  ChecklistActionScheduleType,
  ChecklistActionScheduleWhenPerform,
  ChecklistType
} from 'types/checklist';
import { ChecklistActionSchedule, JChecklistAction } from 'realmdb/Checklist';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import { ModelsNavigatorParamList, NewChecklistActionNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import React, { useEffect, useRef, useState } from 'react';
import Realm, { BSON } from 'realm';
import { actionScheduleState, getChecklistActionScheduleItems } from 'lib/checklist';
import { eqNumber, eqString } from 'realmdb/helpers';
import { eventKind, useEvent } from 'lib/event';

import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ISODateString } from 'types/common';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { ScrollView } from 'react-native';
import WheelPicker from 'components/atoms/WheelPicker';
import { secondsToMSS } from 'lib/formatters';
import { useObject } from '@realm/react';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSetState } from '@react-native-ajp-elements/core';
import { useTheme } from 'theme';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistActionEditor'>,
  CompositeScreenProps<
    NativeStackScreenProps<ModelsNavigatorParamList, 'ChecklistActionEditor'>,
    NativeStackScreenProps<NewChecklistActionNavigatorParamList, 'NewChecklistAction'>
  >  
>;

const ChecklistActionEditorScreen = ({ navigation, route }: Props) => {
  const {
    checklistType,
    checklistAction,
    modelId,
    eventName,
  } = route.params;

  const theme = useTheme();
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  // If a model id is provided then this action is attached to a checklist on the model, not a checklist template.
  const model = useObject(Model, new BSON.ObjectId(modelId));

  const action = useRef(checklistAction).current;
  // If refId is undefined then we're creating a new action.
  const isNewAction = useRef(checklistAction?.refId === undefined).current;

  // Force non-repeating items for creating a one-time maintenance action.
  const initialScheduleItems = useRef(getChecklistActionScheduleItems(
    (action?.schedule.type || checklistType === ChecklistType.OneTimeMaintenance)
      ? ChecklistActionScheduleType.NonRepeating
      : ChecklistActionScheduleType.Repeating)).current;

  const [description, setDescription] = useState(action?.description);
  const [cost, setTotalCost] = useState(action?.cost?.toFixed(2));
  const [notes, setNotes] = useState(action?.notes);
  const [selectedSchedule, setSelectedSchedule] = useSetState<Omit<ChecklistActionSchedule, keyof Realm.Object>>();

  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const schedulePickerItems = useRef(initialScheduleItems.items);
  const [schedulePickerValue, setSchedulePickerValue] = useState<string[]>(
    action
    ? [action.schedule.value.toString(), action.schedule.period ]
    : initialScheduleItems.default.items);

  const [scheduleStr, setScheduleStr] = useState({
    following: '',
    whenPerform: '',
    whenPerformValue: '',
  });

  useEffect(() => {
    if (checklistType === ChecklistType.OneTimeMaintenance) {
      // Set the selected schedule to 'Today' (appears in non-repeating schedule only).
      // items first index = value wheel, items second index = timeframe wheel
      const todayIndex = initialScheduleItems.items[1].findIndex(k => k.label === ChecklistActionNonRepeatingScheduleTimeframe.Today);
      setSchedulePickerValue([initialScheduleItems.items[0][0].label, initialScheduleItems.items[1][todayIndex].label]);

      // Only need to specify the type, other properties set via hook.
      setSelectedSchedule({
        type: ChecklistActionScheduleType.NonRepeating,
      });
    } else if (!!!action) {
      // Default values for a new action.
      setSelectedSchedule({
        period: initialScheduleItems.default.frequency,
        type: ChecklistActionScheduleType.Repeating,
        value: Number(initialScheduleItems.default.value),
      });
    } else {
      setSelectedSchedule(action.schedule);
    }

    // Initialize wheel items based on schedule type.
    schedulePickerItems.current = getChecklistActionScheduleItems(action?.schedule.type).items;
  }, []);


  useEffect(() => {
    const canSave = !!description && (
      !eqString(action?.description, description) ||
      !eqString(action?.schedule?.period, selectedSchedule.period) ||
      !eqNumber(action?.schedule?.value, selectedSchedule.value?.toString()) ||
      !eqString(action?.schedule?.type, selectedSchedule.type) ||
      !eqNumber(action?.cost, cost) ||
      !eqString(action?.notes, notes)
    );

    const onDone = () => {
      const result: JChecklistAction = {
        history: [],
        ...action,
        description: description!,
        schedule: selectedSchedule,
        cost: Number(cost) || undefined,
        notes,
      };

      result.schedule.state = actionScheduleState(
        result,
        checklistType,
        model || undefined,
      );

      event.emit(eventName, result);
      navigation.goBack();
    };

    setScreenEditHeader(
      {enabled: canSave, action: onDone},
      {visible: isNewAction},
    );
  }, [ description, selectedSchedule, cost, notes ]);

  useEffect(() => {
    event.on('checklist-action-notes', onChangeNotes);
    return () => {
      event.removeListener('checklist-action-notes', onChangeNotes);
    };
  }, []);

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
  };

  useEffect(() => {
    let following: ISODateString | string;
    let followingStr = '';
    const period = schedulePickerValue[1] as ChecklistActionSchedulePeriod;
    const whenPerformValue = whenPerformValueToString(schedulePickerValue[0], schedulePickerValue[1]);

    // Set strings based on selected action schedule.
    switch (period) {
      case ChecklistActionSchedulePeriod.Events:
        if (selectedSchedule.type === ChecklistActionScheduleType.NonRepeating) {
          if (!model) {
            followingStr = ChecklistActionScheduleFollowing.EventAtInstall;
          } else {
            const followingEventNumber = model?.totalEvents ? model.totalEvents + 1 : 1;
            following = `${followingEventNumber}`;
            followingStr = `${eventKind(model.type).name} #${followingEventNumber}`;
          }
        }
        setScheduleStr({
          following: followingStr,
          whenPerform: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleWhenPerform.After : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;

      case ChecklistActionSchedulePeriod.ModelMinutes:
        if (selectedSchedule.type === ChecklistActionScheduleType.NonRepeating) {
          if (!model) {
            followingStr = ChecklistActionScheduleFollowing.TimeAtInstall;
          } else {
            following = `${model.totalTime}`;
            followingStr = `Total Time ${secondsToMSS(model.totalTime, {format: 'm:ss'})}`;
          }
        }
        setScheduleStr({
          following: followingStr,
          whenPerform: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleWhenPerform.After : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;

      case ChecklistActionSchedulePeriod.Days:
      case ChecklistActionSchedulePeriod.Weeks:
      case ChecklistActionSchedulePeriod.Months:
        if (selectedSchedule.type === ChecklistActionScheduleType.NonRepeating) {
          if (!model) {
            followingStr = ChecklistActionScheduleFollowing.InstallDate;
          } else {
            following = DateTime.now().toISO()!;
            followingStr = DateTime.now().toFormat('MMMM d, yyyy');
          }
        }
        setScheduleStr({
          following: followingStr,
          whenPerform: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleWhenPerform.In : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;

      case ChecklistActionSchedulePeriod.Today:
        setScheduleStr({
          following: '',
          whenPerform: ChecklistActionScheduleWhenPerform.Now,
          whenPerformValue,
        });
        break;
    }

    setSelectedSchedule(prevState => {
      return {
        ...prevState,
        following,
        period,
        value: Number(schedulePickerValue[0]),
      }
    });
  },[ schedulePickerValue, selectedSchedule.type ]);

  function whenPerformValueToString(value: string, period: string) { // Need to hoist
    if (period === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
      return period;
    } else {
      return `${value} ${Number(value) > 1 ? period : period.replace(/s$/, '')}`;
    }
  };
  
  const toggleActionRepeats = (value: boolean) => {
    const newType = value
      ? ChecklistActionScheduleType.Repeating
      : ChecklistActionScheduleType.NonRepeating;

    setSelectedSchedule(prevState => {
      return {
        ...prevState,
        type: newType,
      }
    });

    // If there are changes to the items then the picker wheel is updated.
    schedulePickerItems.current = getChecklistActionScheduleItems(newType).items;
  };

  const toggleSchedulePickerOpen = () => {
    setSchedulePickerOpen(!schedulePickerOpen);
  };

  const hideValueWheel = schedulePickerValue[1] === ChecklistActionNonRepeatingScheduleTimeframe.Today;

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'PERFORM'} />
      <ListItemInput
        value={description}
        placeholder={'Brief action description'}
        position={['first', 'last']}
        onChangeText={setDescription}
      /> 
      <Divider text={'ON SCHEDULE'} />
      <ListItem
        title={scheduleStr.whenPerform}
        value={scheduleStr.whenPerformValue}
        position={
          action?.history.length && scheduleStr.following
            ? ['first']
            : action?.history.length
              ? ['first', 'last']
              : ['first']
        }
        onPress={toggleSchedulePickerOpen}
        rightImage={false}
        disabled={
          (action?.schedule.type === ChecklistActionScheduleType.NonRepeating && action?.history.length > 0) ||
          checklistType === ChecklistType.OneTimeMaintenance
        }
        expanded={schedulePickerOpen}
        ExpandableComponent={
          // Wheel index 0 is value, wheel index 1 is timeframe/frequency.
          <WheelPicker
            placeholder={'none'}
            itemWidth={hideValueWheel ? ['0%', '100%'] : ['30%', '70%']}
            wheelVisible={[!hideValueWheel, true]}
            items={schedulePickerItems.current}
            value={schedulePickerValue}
            onValueChange={(_wheelIndex, value, _index) => {
              setSchedulePickerValue(value as string[]);
            }}
          />
        }
      /> 
      <ListItem
        title={'Following'}
        value={scheduleStr.following}
        visible={!!scheduleStr.following}
        position={
          action?.schedule.type === ChecklistActionScheduleType.NonRepeating && 
          action?.history.length > 0
            ? ['last']
            : []
        }
        rightImage={false}
        onPress={() => null}
      />
      {!action?.history.length ?
        <ListItemSwitch
          title={'Action Repeats'}
          value={selectedSchedule.type === ChecklistActionScheduleType.Repeating}
          disabled={selectedSchedule?.period === ChecklistActionNonRepeatingScheduleTimeframe.Today}
          position={['last']}
          onValueChange={toggleActionRepeats}
        />
      :
        <Divider type={'note'} text={'Changes to the action are limited. This action has been performed at least once.'} />
      }
      {checklistType === ChecklistType.OneTimeMaintenance &&
        <Divider type={'note'} text={'Changes to the action are limited. This is a one-time maintenance action.'} />
      }
      {(checklistType === ChecklistType.Maintenance || checklistType === ChecklistType.OneTimeMaintenance) &&
        <>
          <Divider text={'MAINTENANCE COSTS'} />
          <ListItemInput
            title={'Total Costs'}
            value={cost}
            numeric={true}
            keyboardType={'number-pad'}
            placeholder={'None'}
            position={['first', 'last']}
            onChangeText={setTotalCost}
          />
        </>
      }
      <Divider text={'NOTES'} />
      <ListItem
        title={notes || 'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('NotesEditor', {
          title: 'Action Notes',
          text: notes,
          eventName: 'checklist-action-notes',
        })}
      />
      {modelId && action &&
        <>
          <Divider text={'HISTORY'} />
          <ListItem
            title={'History'}
            value={action.history.length === 1 ? `${action.history.length} entry` : `${action.history.length} entries`}
            position={['first', 'last']}
            onPress={() => navigation.navigate('ChecklistActionHistory', {
              action,
              modelId,
            })}
          />
        </>
      }
    </ScrollView>
  );
};

export default ChecklistActionEditorScreen;
