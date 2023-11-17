import { AppTheme, useTheme } from 'theme';
import { SectionList, SectionListData, Text, View } from 'react-native';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { BatteryCycle } from 'types/battery';
import { DateTime } from 'luxon';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { makeStyles } from '@rneui/themed';

interface Section {
  title: string;
  data: BatteryCycle[];
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCycles'>;

const BatteryCyclesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const cycles: BatteryCycle[] = [{
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
  }];

  const filterCycle = (cycle: BatteryCycle) => {
    // Return true to include in visible result set.
    return true;
  };

  const groupCycles = (cycles: BatteryCycle[]): SectionListData<BatteryCycle, Section>[] => {
    const groupedCycles: {
      [key in string]: BatteryCycle[];
    } = {};

    cycles.forEach(cycle => {
      if (filterCycle(cycle)) {
        const groupTitle = DateTime.fromISO(cycle.discharge.date).toFormat(
          'MMMM yyyy',
        );
        groupedCycles[groupTitle] = groupedCycles[groupTitle] || [];
        groupedCycles[groupTitle].push(cycle);
      }
    });

    const cyclesSectionData: SectionListData<BatteryCycle, Section>[] = [];
    Object.keys(groupedCycles).forEach(group => {
      cyclesSectionData.push({
        title: group,
        data: groupedCycles[group],
      });
    });

    return cyclesSectionData;
  };

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={s.sectionList}
      sections={groupCycles(cycles)}
      keyExtractor={item => item.id}
      renderItem={({item, index, section}) => (
        <ListItem
          key={index}
          title={`#${item.cycleNumber}`}
          containerStyle={{marginHorizontal: 15}}
          position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
          onPress={() => navigation.navigate('BatteryCycle', {
            batteryCycleId: '1',
          })}
        />
      )}
      renderSectionHeader={({section: {title}}) => (
        <View style={s.sectionHeaderContainer}>
          <Text style={s.sectionHeader}>
            {title}
          </Text>
        </View>
      )}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
  sectionHeaderContainer: {
    height: 35,
    paddingTop: 12,
    paddingHorizontal: 25,
    backgroundColor: theme.colors.listHeaderBackground,
  },
  sectionHeader: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim
  },
}));


export default BatteryCyclesScreen;
