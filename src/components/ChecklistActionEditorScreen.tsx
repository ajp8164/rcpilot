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
import { eqNumber, eqString } from 'realmdb/helpers';

import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Realm from 'realm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import WheelPicker from 'components/atoms/WheelPicker';
import { getChecklistActionScheduleItems } from 'lib/checklist';
import { useEvent } from 'lib/event';
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
    eventName,
  } = route.params;

  const theme = useTheme();
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();
  
  const action = useRef(checklistAction).current;
  // If refId is undefined then we're creating a new action.
  const isNewAction = useRef(checklistAction?.refId === undefined).current;

  const initialScheduleItems = useRef(getChecklistActionScheduleItems(action?.schedule.type ? ChecklistActionScheduleType.NonRepeating : ChecklistActionScheduleType.Repeating)).current;

  const [description, setDescription] = useState(action?.description);
  const [cost, setTotalCost] = useState(action?.cost?.toFixed(2));
  const [notes, setNotes] = useState(action?.notes);
  const [selectedSchedule, setSelectedSchedule] = useSetState<Omit<ChecklistActionSchedule, keyof Realm.Object>>();

  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const [schedulePickerValue, setSchedulePickerValue] = useState<string[]>(action ?  [action.schedule.value.toString(), action.schedule.period ] : initialScheduleItems.default.items);
  const schedulePickerItems = useRef(initialScheduleItems.items);
  const [scheduleStr, setScheduleStr] = useSetState({
    following: '',
    whenPerform: '',
    whenPerformValue: '',
  });

  useEffect(() => {
    if (!!!action) {
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
        ...action,
        description: description!,
        schedule: selectedSchedule,
        cost: Number(cost) || undefined,
        notes,
      };
          
      if (checklistType === ChecklistType.Maintenance) {
        result.cost = cost ? Number(cost) : undefined;
      }

      event.emit(eventName, result);
      navigation.goBack();
    };

    setScreenEditHeader(
      {enabled: canSave, action: onDone},
      {enabled: isNewAction},
    );
  }, [ description, selectedSchedule, cost, notes ]);

  useEffect(() => {
    event.on('checklist-template-action-notes', setNotes);
    return () => {
      event.removeListener('checklist-template-action-notes', setNotes);
    };
  }, []);

  useEffect(() => {
    const period = schedulePickerValue[1] as ChecklistActionSchedulePeriod;
    const whenPerformValue = whenPerformValueToString(schedulePickerValue[0], schedulePickerValue[1]);

    // Set strings based on selected action schedule.
    switch (period) {
      case ChecklistActionSchedulePeriod.Events:
        setScheduleStr({
          following: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleFollowing.EventAtInstall : '',
          whenPerform: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleWhenPerform.After : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;
      case ChecklistActionSchedulePeriod.ModelMinutes:
        setScheduleStr({
          following: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleFollowing.TimeAtInstall : '',
          whenPerform: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleWhenPerform.After : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;
      case ChecklistActionSchedulePeriod.Days:
      case ChecklistActionSchedulePeriod.Weeks:
      case ChecklistActionSchedulePeriod.Months:
        setScheduleStr({
          following: selectedSchedule.type === ChecklistActionScheduleType.NonRepeating ? ChecklistActionScheduleFollowing.InstallDate : '',
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
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
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
          position={['first']}
          onPress={toggleSchedulePickerOpen}
          rightImage={false}
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
          rightImage={false}
          onPress={() => null}
        />
        <ListItemSwitch
          title={'Action Repeats'}
          value={selectedSchedule.type === ChecklistActionScheduleType.Repeating}
          disabled={selectedSchedule?.period === ChecklistActionNonRepeatingScheduleTimeframe.Today}
          position={['last']}
          onValueChange={toggleActionRepeats}
        />
        {checklistType === ChecklistType.Maintenance &&
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
          onPress={() => navigation.navigate('Notes', {
            title: 'Action Notes',
            text: notes,
            eventName: 'checklist-template-action-notes',
          })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChecklistActionEditorScreen;
