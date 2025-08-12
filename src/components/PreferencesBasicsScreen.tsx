import { Divider, ListItem, ListItemSwitch } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from 'theme';
import { UnitSystem } from 'types/common';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PreferencesBasics'
>;

const PreferencesBasicsScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  const [timerDimsScreenEnabled, setTimerDimsScreenEnabled] = useState(false);
  const [resetFilterSystemEnabled, setResetFilterSystemEnabled] =
    useState(false);

  const toggleTimerDimsScreen = (value: boolean) => {
    setTimerDimsScreenEnabled(value);
  };

  const toggleResetFilterSystem = (value: boolean) => {
    setResetFilterSystemEnabled(value);
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'Units'}
        value={'US Customary'}
        position={['first']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Units',
            values: Object.values(UnitSystem),
            selected: UnitSystem.USCustomary,
            eventName: 'unit-system',
          })
        }
      />
      <ListItemSwitch
        title={'Timer Dims Screen'}
        value={timerDimsScreenEnabled}
        onValueChange={toggleTimerDimsScreen}
      />
      <ListItemSwitch
        title={'Reset Filter System to Defaults'}
        value={resetFilterSystemEnabled}
        position={['last']}
        onValueChange={toggleResetFilterSystem}
      />
      <Divider />
    </ScrollView>
  );
};

export default PreferencesBasicsScreen;
