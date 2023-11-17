import { AppTheme, useTheme } from 'theme';
import { BatteriesNavigatorParamList, NewBatteryNavigatorParamList } from 'types/navigation';
import { Battery, BatteryChemistry } from 'types/battery';
import { BatteryViewMethods, BatteryViewProps } from './types';
import { Divider, ListItemSwitch } from '@react-native-ajp-elements/ui';
import {ListItem, ListItemInput} from 'components/atoms/List';
import React, { useState } from 'react';
import { batteryCellConfigurationToString, getBatteryCellConfigurationItems } from 'lib/battery';

import { ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import WheelPicker from 'components/atoms/WheelPicker';
import { makeStyles } from '@rneui/themed';
import { toArrayOrdinals } from 'lib/utils';
import { useNavigation } from '@react-navigation/core';
import { useSetState } from '@react-native-ajp-elements/core';

type BatteryView = BatteryViewMethods;

type NavigationProps = StackNavigationProp<NewBatteryNavigatorParamList, 'NewBattery'>;
type BaseNavigationProps = StackNavigationProp<BatteriesNavigatorParamList, 'Battery'>;

const BatteryView = (props: BatteryViewProps) => {
  const { batteryId } = props;

  const navigation = useNavigation<NavigationProps>();
  const baseNavigation = useNavigation<BaseNavigationProps>();

  const theme = useTheme();
  const s = useStyles(theme);

  const mockBattery: Battery = {
    id: batteryId || '-1',
    chemistry: BatteryChemistry.LiPo,
    cellConfiguration: [1, 1],
  };

  const [battery, setBattery] = useSetState<Battery>(mockBattery);
  const [isRetired, setIsRetired] = useState(false);
  const [cellConfiguration, setCellConfiguration] = useState<string[]>([]);
  const [expandedCellConfiguration, setExpandedCellConfiguration] = useState(false);

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
      onPress={() => navigation.navigate('BatteryChemistry')}
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
            setBattery({ cellConfiguration: toArrayOrdinals(value as string[]) });
          }}
        />
      }
      />
    <ListItemInput
      title={'Discharge Rate'}
      value={'Unknown'}
      label='C'
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
          onPress={() => baseNavigation.navigate('BatteryPerformance')}
        />
        <ListItem
          title={'Logged Cycle Details'}
          value={'0'}
          position={['last']}
          onPress={() => baseNavigation.navigate('BatteryCycles')}
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
      onPress={() => navigation.navigate('BatteryTint')}
    />
    <ListItem
      title={'QR Code Size'}
      value={'None'}
      position={['last']}
      onPress={() => navigation.navigate('ScanCodeSize')}
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
      onPress={() => navigation.navigate('Notes')}
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
