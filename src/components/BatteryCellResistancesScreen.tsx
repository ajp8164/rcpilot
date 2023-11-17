import { BatteriesNavigatorParamList } from 'types/navigation';
import { BatteryCycle } from 'types/battery';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCellResistances'>;

const BatteryCellResistancesScreen = ({ route }: Props) => {
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
      cellResisance: [],
    },
    charge: {
      date: '2023-11-17T03:28:04.651Z',
      amount: 450,
      packVoltage: 11.1,
      packResistance: 200,
      // 1S/1P 2S/1P 3S/1P
      cellVoltage: [],
      cellResisance: [],
    },
    notes: '',
  };

  return (
    <View
      style={theme.styles.view}>
    <Divider text={'OVERALL PACK RESISTANCE'} />
    <ListItemInput
      title={'Total Pack'}
      label={'V'}
      value={'Unknown'}
      position={['first', 'last']}
      keyboardType={'decimal-pad'}
      />
    <Divider text={'PER-CELL RESISTENACES'}/>
    {cycle.discharge.cellResisance.map((resistance, index) => {
      const s = (index % series) + 1;
      const p = index;
      return (
        <ListItemInput
          title={`S Cell ${s} in P Leg ${p}`}
          label={'mΩ'}
          value={`${resistance}`}
          keyboardType={'decimal-pad'}
        /> 
      );
    })}
  </View>
  );
};

export default BatteryCellResistancesScreen;
