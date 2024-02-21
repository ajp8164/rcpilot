import React, { useEffect } from 'react';

import { Battery } from 'realmdb/Battery';
import BatteryPickerView from 'components/views/BatteryPickerView';
import { EmptyView } from 'components/molecules/EmptyView';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useEvent } from 'lib/event';
import { useQuery } from '@realm/react';
import { useTheme } from 'theme';

export type BatteryPickerInterface = {
  mode?: 'one' | 'many';
  title: string;
  backTitle?: string;
  selected?: Battery | Battery[]; // The literal value(s)
  eventName: string;
};

export type BatteryPickerResult = {
  batteries: Battery[];
}

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'BatteryPicker'>;

const BatteryPickerScreen = ({ navigation, route }: Props) => {
  const {
    mode = 'one',
    title,
    backTitle,
    selected,
    eventName,
  } = route.params;
  const theme = useTheme();
  const event = useEvent();

  const activeBatteries = useQuery(Battery, batteries => { return batteries.filtered('retired == $0', false) }, []);

  useEffect(() => {
    navigation.setOptions({
      title,
      headerBackTitle: backTitle,
    });
  }, []);

  const onSelect = (selected: Battery[]) => {
    event.emit(eventName, {batteries: selected} as BatteryPickerResult);
  };

  if (!activeBatteries.length) {
    return (
      <EmptyView info message={'No Batteries'} details={"Add your first battery on the Batteries tab."} />
    );    
  }

  return (
    <View style={theme.styles.view}>
      <BatteryPickerView 
        batteries={activeBatteries}
        mode={mode}
        selected={selected}
        onSelect={onSelect}
      />
    </View>
  );
};

export default BatteryPickerScreen;
