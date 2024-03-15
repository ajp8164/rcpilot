import React, { useEffect, useRef } from 'react';

import { Battery } from 'realmdb/Battery';
import BatteryPickerView from 'components/views/BatteryPickerView';
import { EmptyView } from 'components/molecules/EmptyView';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useEvent } from 'lib/event';
import { useQuery } from '@realm/react';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

export type BatteryPickerInterface = {
  mode?: 'one' | 'many';
  title: string;
  backTitle?: string;
  selected?: Battery | Battery[]; // The literal value(s)
  query?: string; // A RQL query string
  onDone?: (batteries: Battery[]) => void;
  eventName?: string;
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
    query,
    onDone: callback,
    eventName,
  } = route.params;
  const theme = useTheme();
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  let pickerBatteries = useQuery(Battery, batteries => { return batteries.filtered('retired == $0', false) }, []);
  if (query) {
    pickerBatteries = pickerBatteries.filtered(query);
  }

  const selectedBatteries = useRef<Battery[]>([]);

  // This picker can send the selected batteries via an event and/or have a callback invoked
  // which provides the selected batteries as a parameter.
  useEffect(() => {
    const onDone = () => {
      navigation.goBack();
      setTimeout(() => {
        callback && callback(selectedBatteries.current);
      });
    };
    
    setScreenEditHeader(
      {label: 'Done', action: onDone},
      undefined,
      {title, headerBackTitle: backTitle}
    );
  }, []);

  const onSelect = (selected: Battery[]) => {
    selectedBatteries.current = selected;
    eventName && event.emit(eventName, {batteries: selected} as BatteryPickerResult);
  };

  if (!pickerBatteries.length) {
    return (
      <EmptyView message={'No Batteries Found!'} />
    );    
  }

  return (
    <View style={theme.styles.view}>
      <BatteryPickerView 
        batteries={pickerBatteries}
        mode={mode}
        selected={selected}
        onSelect={onSelect}
      />
    </View>
  );
};

export default BatteryPickerScreen;
