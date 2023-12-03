import { ChecklistAction, ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionNonRepeatingScheduleWhenPerform, ChecklistActionRepeatingScheduleFrequency, ChecklistActionScheduleFollowing } from 'types/checklistTemplate';
import { ChecklistActionEditorViewMethods, ChecklistActionEditorViewProps } from './types';
import {ListItem, ListItemInput, ListItemSwitch} from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { View } from 'react-native';
import WheelPicker from 'components/atoms/WheelPicker';
import { getChecklistActionScheduleItems } from 'lib/checklistTemplate';
import { useNavigation } from '@react-navigation/core';
import { useSetState } from '@react-native-ajp-elements/core';

type ChecklistActionEditor = ChecklistActionEditorViewMethods;

const ChecklistActionEditor = (props: ChecklistActionEditorViewProps) => {
  const { checklistTemplateId } = props;

  const navigation = useNavigation<any>();

  const [action, setAction] = useState<ChecklistAction>({
    description: 'Set flight mode 1',
    // repeatingSchedule: {
    //   frequency: ChecklistActionRepeatingScheduleFrequency.Events,
    //   value: 1,
    // },
    nonRepeatingSchedule: {
      timeframe: ChecklistActionNonRepeatingScheduleTimeframe.Events,
      value: 1,
    },
    totalCost: 0,
    notes: '',
  });

  const [actionRepeatsEnabled, setActionRepeatsEnabled] = useState(false);
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const [actionSchedule, setActionSchedule] = useState<string[]>(getChecklistActionScheduleItems(action).defaultValue);
  const scheduleItems = useRef(getChecklistActionScheduleItems(action).items);
  const [scheduleStr, setScheduleStr] = useSetState({
    following: '',
    followingValid: false,
    whenPerform: '',
    whenPerformValue: '',
  });

  useEffect(() => {
    const count = Number(actionSchedule[0]);
    const timeframe = actionSchedule[1];

    // Set strings based on selected action schedule.
    switch (timeframe) {
      case ChecklistActionNonRepeatingScheduleTimeframe.Events:
        setScheduleStr({
          following: ChecklistActionScheduleFollowing.EventAtInstall,
          followingValid: true,
          whenPerform: ChecklistActionNonRepeatingScheduleWhenPerform.After,
          whenPerformValue: whenPerformValueToString(),
        });
        break;
      case ChecklistActionNonRepeatingScheduleTimeframe.ModelMinutes:
        setScheduleStr({
          following: ChecklistActionScheduleFollowing.TimeAtInstall,
          followingValid: true,
          whenPerform: ChecklistActionNonRepeatingScheduleWhenPerform.After,
          whenPerformValue: whenPerformValueToString(),
        });
        break;
      case ChecklistActionNonRepeatingScheduleTimeframe.Days:
      case ChecklistActionNonRepeatingScheduleTimeframe.Weeks:
      case ChecklistActionNonRepeatingScheduleTimeframe.Months:
        setScheduleStr({
          following: ChecklistActionScheduleFollowing.InstallDate,
          followingValid: true,
          whenPerform: ChecklistActionNonRepeatingScheduleWhenPerform.In,
          whenPerformValue: whenPerformValueToString(),
        });
        break;
      case ChecklistActionNonRepeatingScheduleTimeframe.Today:
        setScheduleStr({
          following: '',
          followingValid: false,
          whenPerform: ChecklistActionNonRepeatingScheduleWhenPerform.Now,
          whenPerformValue: whenPerformValueToString(),
        });
        break;
    }

    // Detect a change in the repeating schedule setting and change the action schedule.
    // Keep the settings across the change (transfer values between schedule types).
    let changedAction: ChecklistAction;
    if (action.nonRepeatingSchedule && actionRepeatsEnabled) {
      // Changing to a repeating schedule.
      changedAction = {
        ...action,
        repeatingSchedule: {
          frequency:  action.nonRepeatingSchedule.timeframe as string as ChecklistActionRepeatingScheduleFrequency,
          value: action.nonRepeatingSchedule.value,
        },
      };
      delete changedAction.nonRepeatingSchedule;

    } else if (action.repeatingSchedule && !actionRepeatsEnabled) {
      // Changing to a non-repeating schedule.
      changedAction = {
        ...action,
        nonRepeatingSchedule: {
          timeframe: action.repeatingSchedule.frequency as string as ChecklistActionNonRepeatingScheduleTimeframe,
          value: action.repeatingSchedule.value,
        },
      };
      delete changedAction.repeatingSchedule;
      
    } else if (action.nonRepeatingSchedule) {
      // Non-repeating schedule updated.
      changedAction = {
        ...action,
        nonRepeatingSchedule: {
          timeframe: timeframe as ChecklistActionNonRepeatingScheduleTimeframe,
          value: count,
        }
      };

    } else {
      // Repeating schedule updated.
      changedAction = {
        ...action,
        repeatingSchedule: {
          frequency: timeframe as ChecklistActionRepeatingScheduleFrequency,
          value: count,
        }
      };
    }

    setAction(changedAction);
    
    // If there are changes to the items then the picker wheel is updated.
    scheduleItems.current = getChecklistActionScheduleItems(changedAction).items;
  },[actionSchedule, actionRepeatsEnabled]);

  const whenPerformValueToString = () => {
    const count = Number(actionSchedule[0]);
    const timeframe = actionSchedule[1];

    if (timeframe === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
      return timeframe;
    } else {
      return `${count} ${count > 1 ? timeframe : timeframe.replace(/s$/, '')}`;
    }
  };

  const toggleActionRepeats = (value: boolean) => {
    setActionRepeatsEnabled(value);
  };

  const toggleSchedulePickerOpen = () => {
    setSchedulePickerOpen(!schedulePickerOpen);
  };

  return (
    <View>
      <Divider text={'PERFORM'} />
      <ListItemInput
        value={action.description}
        placeholder={'Brief action description'}
        position={['first', 'last']}
        onChangeText={() => null}
      /> 
      <Divider text={'ON SCHEDULE'} />
      <ListItem
        title={scheduleStr.whenPerform}
        value={scheduleStr.whenPerformValue}
        position={['first']}
        onPress={toggleSchedulePickerOpen}
        expanded={schedulePickerOpen}
        ExpandableComponent={
          <WheelPicker
            placeholder={'none'}
            itemWidth={['30%', '70%']}
            items={scheduleItems.current}
            value={actionSchedule}
            onValueChange={(_wheelIndex, value, _index) => {
              setActionSchedule(value as string[]);
            }}
          />
        }
      /> 
      <ListItem
        title={'Following'}
        value={scheduleStr.following}
        visible={!actionRepeatsEnabled && scheduleStr.followingValid}
      />
      <ListItemSwitch
        title={'Action Repeats'}
        value={actionRepeatsEnabled}
        disabled={action.nonRepeatingSchedule?.timeframe === ChecklistActionNonRepeatingScheduleTimeframe.Today}
        position={['last']}
        onValueChange={toggleActionRepeats}
      />
      <Divider text={'MAINTENANCE COSTS'} />
      <ListItemInput
        title={'Total Costs'}
        value={''}
        placeholder={'None'}
        position={['first', 'last']}
        onChangeText={() => null}
      /> 
      <Divider text={'NOTES'} />
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('Notes', {
          title: 'Action Notes',
        })}
      />
    </View>
  );
};

export default ChecklistActionEditor;
