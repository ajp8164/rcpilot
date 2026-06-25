import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useEvent } from '@react-native-hello/core';
import { useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@realm/react';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import BatteryPickerView from 'components/views/BatteryPickerView';
import { Check } from 'lucide-react-native';
import { Battery } from 'realmdb/Battery';
import { MultipleNavigatorParamList } from 'types/navigation';

export type BatteryPickerInterface = {
  mode?: 'one' | 'many';
  title: string;
  backTitle?: string;
  selected?: Battery[]; // The literal value(s)
  query?: string; // A RQL query string
  onDone?: (batteries: Battery[]) => void;
  eventName?: string;
};

export type BatteryPickerResult = {
  batteries: Battery[];
};

export type Props = NativeStackScreenProps<
  MultipleNavigatorParamList,
  'BatteryPicker'
>;

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

  let pickerBatteries = useQuery(
    Battery,
    batteries => {
      return batteries.filtered('retired == $0', false);
    },
    [],
  );
  if (query) {
    pickerBatteries = pickerBatteries.filtered(query);
  }

  const selectedBatteries = useRef<Battery[]>(selected || []);

  // This picker can send the selected batteries via an event and/or have a callback invoked
  // which provides the selected batteries as a parameter.
  useEffect(() => {
    const onDone = () => {
      navigation.goBack();
      setTimeout(() => {
        callback?.(selectedBatteries.current);
      });
    };

    navigation.setOptions(
      headerOptions({
        title,
        headerBackTitle: backTitle,
        right: [<HeaderIconButton Icon={Check} onPress={onDone} />],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (selected: Battery[]) => {
    selectedBatteries.current = selected;
    if (eventName) {
      event.emit(eventName, { batteries: selected } as BatteryPickerResult);
    }
  };

  if (!pickerBatteries.length) {
    return <EmptyView error message={'No Batteries Found!'} />;
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
