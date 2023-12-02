import { AppTheme, useTheme } from 'theme';
import { ChecklistAction, ChecklistActionRepeatingScheduleFrequency } from 'types/checklistTemplate';
import { ChecklistActionEditorViewMethods, ChecklistActionEditorViewProps } from './types';
import {ListItem, ListItemInput, ListItemSwitch} from 'components/atoms/List';
import React, { useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { View } from 'react-native';
import WheelPicker from 'components/atoms/WheelPicker';
import { getChecklistActionScheduleItems } from 'lib/checklistTemplate';
import { makeStyles } from '@rneui/themed';
import { useNavigation } from '@react-navigation/core';

type ChecklistActionEditor = ChecklistActionEditorViewMethods;

const ChecklistActionEditor = (props: ChecklistActionEditorViewProps) => {
  const { checklistTemplateId } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const navigation = useNavigation<any>();

  const action: ChecklistAction = {
    description: 'Set flight mode 1',
    repeatingSchedule: {
      frequency: ChecklistActionRepeatingScheduleFrequency.Events,
      value: 1,
    },
    totalCost: 0,
    notes: '',
  };

  const [actionRepeatsEnabled, setActionRepeatsEnabled] = useState(false);
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const [actionSchedule, setActionSchedule] = useState<string[]>();

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
        title={'Perform'}
        value={'Today'}
        position={['first']}
        onPress={toggleSchedulePickerOpen}
        expanded={schedulePickerOpen}
        ExpandableComponent={
          <WheelPicker
            placeholder={'none'}
            itemWidth={['30%', '70%']}
            items={getChecklistActionScheduleItems(action).items}
            value={actionSchedule || getChecklistActionScheduleItems(action).defaultValue}
            onValueChange={(_wheelIndex, value, _index) => {
              setActionSchedule(value as string[]);
            }}
          />
        }
      /> 
      <ListItem
        title={'Following'}
        value={'Today'}
        visible={!actionRepeatsEnabled}
      />
      <ListItemSwitch
        title={'Action Repeats'}
        value={actionRepeatsEnabled}
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

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
}));

export default ChecklistActionEditor;
