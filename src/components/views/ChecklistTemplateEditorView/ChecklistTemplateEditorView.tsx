import { AppTheme, useTheme } from 'theme';
import { ChecklistAction, ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionRepeatingScheduleFrequency, ChecklistTemplate, ChecklistTemplateType } from 'types/checklistTemplate';
import { ChecklistTemplateEditorViewMethods, ChecklistTemplateEditorViewProps } from './types';
import { FlatList, ListRenderItem, View } from 'react-native';
import {ListItem, ListItemInput} from 'components/atoms/List';
import { NewChecklistTemplateNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import React, { useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useNavigation } from '@react-navigation/core';

type ChecklistTemplateEditorView = ChecklistTemplateEditorViewMethods;

type NavigationProps = 
  NativeStackNavigationProp<SetupNavigatorParamList, 'ChecklistTemplateEditor'> &
  NativeStackNavigationProp<NewChecklistTemplateNavigatorParamList, 'NewChecklistTemplate'>;

const ChecklistTemplateEditorView = (props: ChecklistTemplateEditorViewProps) => {
  const { checklistTemplateId } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const navigation = useNavigation<NavigationProps>();

  const mockChecklistTemplate: ChecklistTemplate = {
    id: '1',
    name: 'PreFlight 1',
    type: ChecklistTemplateType.PreEvent,
    actions: [
      {
        description: 'Set flight mode 1',
        repeatingSchedule: {
          frequency: ChecklistActionRepeatingScheduleFrequency.Events,
          value: 1,
        },
        totalCost: 0,
        notes: '',
      },
      {
        description: 'Throttle hold on',
        repeatingSchedule: {
          frequency: ChecklistActionRepeatingScheduleFrequency.Events,
          value: 1,
        },
        totalCost: 0,
        notes: '',
      },
      {
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

  const renderActions: ListRenderItem<ChecklistAction> = ({ item: action, index }) => {
    return (
      <ListItem
        key={index}
        title={action.description}
        subtitle={actionScheduleToString(action)}
        position={checklistTemplate.actions.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === checklistTemplate.actions.length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ChecklistActionEditor', {
          checklistTemplateId: checklistTemplate.id,
          actionIndex: index,
        })}
      />
    );
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
      <FlatList
        data={checklistTemplate.actions}
        renderItem={renderActions}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
      />
      <Divider />
      <ListItem
        title={'Add a New Action'}
        titleStyle={s.add}
        position={['first', 'last']}
        rightImage={false}        
        onPress={() => navigation.navigate('NewChecklistActionNavigator', {
          screen: 'NewChecklistAction',
          params: { checklistTemplateId },
        })}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  add: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
}));

export default ChecklistTemplateEditorView;
