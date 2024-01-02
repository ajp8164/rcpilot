import { BatteriesNavigatorParamList, NewBatteryCycleNavigatorParamList } from 'types/navigation';
import { FlatList, ListRenderItem, View } from 'react-native';

import { BatteryCycle } from 'types/battery';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'theme';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCellVoltages'>,
  NativeStackScreenProps<NewBatteryCycleNavigatorParamList>
>;

const BatteryCellVoltagesScreen = ({ route }: Props) => {
  const theme = useTheme();

  // route.params.batteryCycleId;
  const series = 3;
  const parallel = 1;

  const cycle: BatteryCycle = {
    id: '1',
    cycleNumber: 1,
    batteryId: '1',
    ignoreInPlots: false,
    discharge: {
      date: '2023-11-17T03:28:04.651Z',
      duration: '30:25', 
      packVoltage: 11.1,
      packResistance: 200,
      // 1S/1P 2S/1P 3S/1P (series then parallel)
      cellVoltage: [],
      cellResistance: [],
    },
    charge: {
      date: '2023-11-17T03:28:04.651Z',
      amount: 450,
      packVoltage: 11.1,
      packResistance: 200,
      // 1S/1P 2S/1P 3S/1P
      cellVoltage: [],
      cellResistance: [],
    },
    notes: '',
  };

  const renderVoltage: ListRenderItem<number> = ({ item: voltage, index }) => {
    const s = (index % series) + 1;
    const p = index;
    return (
      <ListItemInput
        title={`S Cell ${s} in P Leg ${p}`}
        label={'V'}
        value={`${voltage}`}
        keyboardType={'decimal-pad'}
      /> 
    );
  };

  return (
    <View
      style={theme.styles.view}>
    <Divider text={'OVERALL PACK-VOLTAGE'} />
    <ListItemInput
      title={'Total Pack'}
      label={'V'}
      value={'Unknown'}
      keyboardType={'decimal-pad'}
      position={['first', 'last']}
      />
    <Divider text={'PER-CELL VOLTAGES'}/>
    <FlatList
      data={cycle.discharge.cellResistance}
      renderItem={renderVoltage}
      keyExtractor={(_item, index) => `${index}`}
      showsVerticalScrollIndicator={false}
    />
  </View>
  );
};

export default BatteryCellVoltagesScreen;
