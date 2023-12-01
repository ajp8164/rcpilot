import { ChecklistAction, ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionRepeatingScheduleFrequency, ChecklistTemplate, ChecklistTemplateType } from 'types/checklistTemplate';
import { ChecklistTemplateEditorViewMethods, ChecklistTemplateEditorViewProps } from './types';
import {ListItem, ListItemInput} from 'components/atoms/List';
import React, { useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/core';

type ChecklistTemplateEditor = ChecklistTemplateEditorViewMethods;

const ChecklistTemplateEditor = (props: ChecklistTemplateEditorViewProps) => {
  const { checklistTemplateId } = props;

  const navigation = useNavigation<any>();

  const mockChecklistTemplate: ChecklistTemplate = {
    id: '1',
    name: 'PreFlight 1',
    type: ChecklistTemplateType.PreEvent,
    actions: [
      {
        id: '1',
        description: 'Set flight mode 1',
        repeatingSchedule: {
          frequency: ChecklistActionRepeatingScheduleFrequency.Events,
          value: 1,
        },
        totalCost: 0,
        notes: '',
      },
      {
        id: '2',
        description: 'Throttle hold on',
        repeatingSchedule: {
          frequency: ChecklistActionRepeatingScheduleFrequency.Events,
          value: 1,
        },
        totalCost: 0,
        notes: '',
      },
      {
        id: '3',
        description: 'Non repeating thing',
        nonRepeatingSchedule: {
          timeframe: ChecklistActionNonRepeatingScheduleTimeframe.Today,
          value: 0,
        },
        totalCost: 0,
        notes: '',
      }
    ],
};

  const [checklistTemplate, setChecklistTemplate] = useState<ChecklistTemplate>(mockChecklistTemplate);

  const actionScheduleToString = (action: ChecklistAction) => {
    let result = '';

    if (action.repeatingSchedule) {
      let times = '';
      let freq = '';

      if (action.repeatingSchedule!.frequency === ChecklistActionRepeatingScheduleFrequency.ModelMinutes) {
        times = '';
        if (action.repeatingSchedule!.value === 1) {
          freq = 'minute of model time';
        } else {
          freq = 'minutes of model time';
        }
      } else {
        if (action.repeatingSchedule!.value === 1) {
          times = '';
          freq = action.repeatingSchedule!.frequency.toLowerCase().replace(/s$/, '');
        } else {
          times = `${action.repeatingSchedule!.value} `;
          freq = action.repeatingSchedule!.frequency.toLowerCase();
        }

        if (action.repeatingSchedule!.frequency !== ChecklistActionRepeatingScheduleFrequency.Events) {
          freq += ' of calendar time';
        }
      }

      result = `Perform after every ${times}${freq}`;
    } else {
      let after = '';
      let value = '';
      let timeframe = '';

      if (action.nonRepeatingSchedule!.timeframe === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
        value = '';
        timeframe = '';
        after = 'immediatley at install';
      } else {
        value = `${action.nonRepeatingSchedule!.value} `;
        timeframe = action.nonRepeatingSchedule!.timeframe.toString().toLowerCase();

        if (action.nonRepeatingSchedule!.value === 1) {
          timeframe = timeframe.replace(/s$/, '');
        }

        if (action.nonRepeatingSchedule!.timeframe === ChecklistActionNonRepeatingScheduleTimeframe.ModelMinutes) {
          timeframe = 'minutes';
          if (action.nonRepeatingSchedule!.value === 1) {
            timeframe = timeframe.replace(/s$/, '');
          }  
          after = ' after total model time at install';
        } else if (action.nonRepeatingSchedule!.timeframe === ChecklistActionNonRepeatingScheduleTimeframe.Events) {
          after = ' after total events at install';
        }  else {
          after = ' after date at install';
        }
      }

      result = `Perform once ${value}${timeframe}${after}`;
    }
    return result;
  };

  return (
    <View>
      <Divider text={'NAME & TYPE'} />
      <ListItemInput
        value={checklistTemplate.name}
        placeholder={'Checklist Template Name'}
        position={['first']}
        onChangeText={() => null}
      /> 
      <ListItem
        title={'Template for List Type'}
        value={ChecklistTemplateType.PreEvent}
        position={['last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Template Type',
          headerBackTitle: 'Back',
          values: Object.values(ChecklistTemplateType),
          selected: ChecklistTemplateType.PreEvent,
          eventName: 'checklist-template-type',
        })}
        /> 
      <Divider text={'ACTIONS'} />
      {checklistTemplate.actions.map((action, index) => {
        return (
          <ListItem
            title={action.description}
            subtitle={actionScheduleToString(action)}
            position={checklistTemplate.actions.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === checklistTemplate.actions.length - 1 ? ['last'] : []}
            onPress={() => null}
          />
        );
      })}
    </View>
  );
};

export default ChecklistTemplateEditor;
