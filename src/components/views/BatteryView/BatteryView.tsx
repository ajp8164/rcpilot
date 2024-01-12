import { AppTheme, useTheme } from 'theme';
import { BatteriesNavigatorParamList, NewBatteryNavigatorParamList } from 'types/navigation';
import { Battery, BatteryChemistry, BatteryTint } from 'types/battery';
import { BatteryViewMethods, BatteryViewProps } from './types';
import { Divider, ListItemSwitch } from '@react-native-ajp-elements/ui';
import {ListItem, ListItemInput} from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { batteryCellConfigurationToString, getBatteryCellConfigurationItems } from 'lib/battery';

import { ScanCodeSize } from 'types/common';
import { ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import WheelPicker from 'components/atoms/WheelPicker';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { toArrayOrdinals } from 'lib/utils';
import { useEvent } from 'lib/event';
import { useNavigation } from '@react-navigation/core';
import { useSetState } from '@react-native-ajp-elements/core';

type BatteryView = BatteryViewMethods;

type NavigationProps = 
  StackNavigationProp<NewBatteryNavigatorParamList, 'NewBattery'> &
  StackNavigationProp<BatteriesNavigatorParamList, 'Battery'>;

const BatteryView = (props: BatteryViewProps) => {
  const { batteryId } = props;

  const navigation = useNavigation<NavigationProps>();
  const event = useEvent();

  const theme = useTheme();
  const s = useStyles(theme);

  const mockBattery: Battery = {
    id: batteryId || '-1',
    chemistry: BatteryChemistry.LiPo,
    sCells: 1,
    pCells: 1,
    name: '',
    vendor: '',
    purchasePrice: 0,
    retired: false,
    inStorage: false,
    cRating: 0,
    capacity: 0,
    totalCycles: 0,
    lastCycle: '',
    notes: ''
  };

  const [battery, setBattery] = useSetState<Battery>(mockBattery);
  const [isRetired, setIsRetired] = useState(false);
  const [cellConfiguration, setCellConfiguration] = useState<string[]>([]);
  const [expandedCellConfiguration, setExpandedCellConfiguration] = useState(false);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('chemistry', onChangeChemistry);
    event.on('battery-tint', onChangeBatteryTint);
    event.on('scan-code-size', onChangeScanCodeSize);

    return () => {
      event.removeListener('chemistry', onChangeChemistry);
      event.removeListener('battery-tint', onChangeBatteryTint);
      event.removeListener('scan-code-size', onChangeScanCodeSize);
    };
  }, []);

  const onChangeChemistry = (v: string) => {};
  const onChangeBatteryTint = (v: string) => {};
  const onChangeScanCodeSize = (v: string) => {};

  const toggleIsRetired = (value: boolean) => {
    setIsRetired(value);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
    <Divider />
    <ListItem
      title={'150S #1'}
      subtitle={'Pulse'}
      position={['first', 'last']}
      rightImage={false}
      onPress={() => null}
    />
    <Divider />
    <ListItemInput
      title={'Capacity'}
      value={'450'}
      label='mah'
      keyboardType={'number-pad'}
      position={['first']}
    />
    <ListItem
      title={'Chemistry'}
      value={battery.chemistry}
      disabled={batteryId !== undefined}
      rightImage={batteryId === undefined}
      onPress={() => navigation.navigate('EnumPicker', {
        title: 'Chemistry',
        values: Object.values(BatteryChemistry),
        selected: 'LiPo',
        eventName: 'chemistry',
      })}
    />
    <ListItem
      title={'Cell Configuration'}
      value={batteryCellConfigurationToString(battery)}
      rightImage={false}
      expanded={expandedCellConfiguration}
      onPress={() => setExpandedCellConfiguration(!expandedCellConfiguration)}
      ExpandableComponent={
        <WheelPicker
          placeholder={'none'}
          itemWidth={['50%', '50%']}
          items={getBatteryCellConfigurationItems(battery)}
          value={cellConfiguration}
          onValueChange={(_wheelIndex, value, _index) => {
            setCellConfiguration(value as string[]);
            // setBattery({ cellConfiguration: toArrayOrdinals(value as string[]) });
            setBattery({
              sCells: toArrayOrdinals(value as string[])[0],
              pCells: toArrayOrdinals(value as string[])[1]
            });
          }}
        />
      }
      />
    <ListItemInput
      title={'Discharge Rate'}
      value={'Unknown'}
      label={'C'}
      keyboardType={'number-pad'}
      position={['last']}
    />
    <Divider />
    {batteryId &&
      <>
        <ListItem
          title={'Statistics'}
          value={'No cycles'}
          position={['first']}
          rightImage={false}
        />
        <ListItem
          title={'Battery Performance'}
          onPress={() => navigation.navigate('BatteryPerformance')}
        />
        <ListItem
          title={'Logged Cycle Details'}
          value={'0'}
          position={['last']}
          onPress={() => navigation.navigate('BatteryCycles')}
        />
      </>
    }
    {!batteryId &&
      <ListItemInput
        title={'Total Cycles'}
        value={'None'}
        keyboardType={'number-pad'}
        position={['first', 'last']}
      />
    }
    <Divider />
    <ListItem
      title={'Battery Tint'}
      value={'None'}
      position={['first']}
      onPress={() => navigation.navigate('EnumPicker', {
        title: 'Battery Tint',
        values: Object.values(BatteryTint),
        selected: 'None',
        icons: batteryTintIcons,
        eventName: 'battery-tint',
      })}
     />
    <ListItem
      title={'QR Code Size'}
      value={'None'}
      position={['last']}
      onPress={() => navigation.navigate('EnumPicker', {
        title: 'QR Code Size',
        values: Object.values(ScanCodeSize),
        selected: 'None',
        eventName: 'scan-code-size',
      })}
    />
    <Divider />
    <ListItemInput
      title={'Purchase Price'}
      value={'Unknown'}
      keyboardType={'number-pad'}
      position={batteryId ? ['first'] : ['first', 'last']}
    />
    {batteryId &&
    <>
      <ListItemInput
        title={'Operating Cost'}
        value={'Unknown'}
        label={'per cycle'}
        keyboardType={'number-pad'}
        />
      <ListItemSwitch
        title={'Battery is Retired'}
        position={['last']}
        value={isRetired}
        onValueChange={toggleIsRetired}
      />
    </>
    }
    <Divider />
    <ListItem
      title={'Notes'}
      position={['first', 'last']}
      onPress={() => navigation.navigate('Notes', {})}
      />
    <Divider />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  view: {
  },
}));

export default BatteryView;
