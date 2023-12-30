import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemDate, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCycle'>;

const BatteryCycleScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [excludeFromPlotsEnabled, setExcludeFromPlotsEnabled] = useState(false);
  const [expandedCycleDate, setExpandedCycleDate] = useState(false);
  const [cycleDate, setCycleDate] = useState<string>('2023-11-17T03:28:04.651Z');

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <>
            <Icon
              name={'chevron-up'}
              style={s.headerIcon}
              onPress={() => null}
            />
            <Icon
              name={'chevron-down'}
              style={s.headerIcon}
              onPress={() => null}
            />
          </>
        );
      },
    });
  }, []);

  const onCycleDateChange = (date?: Date) => {
    date && setCycleDate(DateTime.fromJSDate(date).toISO() || new Date().toISOString());
  };
  
  return (
    <View
      style={theme.styles.view}>
    <Divider />
    <ListItem
      title={'150S #1'}
      subtitle={'Pulse'}
      position={['first', 'last']}
      rightImage={false}
    />
    <Divider />
    <ListItemDate
      title={'Date'}
      value={cycleDate
        ? DateTime.fromISO(cycleDate).toFormat(
          "MMM d, yyyy 'at' hh:mm a"
        )
        : 'Tap to Set...'}
      pickerValue={cycleDate}
      rightImage={false}
      expanded={expandedCycleDate}
      position={['first']}
      onPress={() => setExpandedCycleDate(!expandedCycleDate)}
      onDateChange={onCycleDateChange}
    />
    <ListItemInput
      title={'Duration'}
      label={'m:ss'}
      value={'4:00'}
    />
    <ListItemInput
      title={'Pack Voltage'}
      label={'V'}
      value={'Value'}
    />
    <ListItemInput
      title={'Pack Resistance'}
      label={'mΩ'}
      value={'Value'}
    />
    <ListItem
      title={'Cell Voltage'}
      onPress={() => navigation.navigate('BatteryCellVoltages', {
        batteryCycleId: '1',
      })}
    />
    <ListItem
      title={'Cell Resistance'}
      position={['last']}
      onPress={() => navigation.navigate('BatteryCellResistances', {
        batteryCycleId: '1',
      })}
    />
    <Divider />
    <ListItemSwitch
      title={'Exclude from Plots'}
      value={excludeFromPlotsEnabled}
      position={['first', 'last']}
      onValueChange={setExcludeFromPlotsEnabled}
    />
    <Divider />
    <ListItem
      title={'Notes'}
      position={['first', 'last']}
      onPress={() => navigation.navigate('Notes', {
        title: 'Cycle Notes',
        text: 'notes', // mock
        eventName: 'battery-cycle-notes',
          })}
    />
  </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
    marginHorizontal: 10,
  },
}));

export default BatteryCycleScreen;
