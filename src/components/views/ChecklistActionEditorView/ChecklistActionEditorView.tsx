import { AppTheme, useTheme } from 'theme';
import { ChecklistAction, ChecklistActionRepeatingScheduleFrequency } from 'types/checklistTemplate';
import { ChecklistActionEditorViewMethods, ChecklistActionEditorViewProps } from './types';
import {ListItem, ListItemInput, ListItemSwitch} from 'components/atoms/List';
import React, { useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { View } from 'react-native';
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

  const toggleActionRepeats = (value: boolean) => {
    setActionRepeatsEnabled(value);
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
        onPress={() => null}
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
