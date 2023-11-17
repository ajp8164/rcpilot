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

const BatteryCyclesScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const cycles: BatteryCycle[] = [{
    id: '1',
    number: 1,
    date: '2023-11-17T03:28:04.651Z'
  }, {
    id: '2',
    number: 2,
    date: '2023-10-17T03:28:04.651Z'
  }, {
    id: '3',
    number: 3,
    date: '2023-10-17T03:28:04.651Z'
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
        const groupTitle = DateTime.fromISO(cycle.date).toFormat(
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
          title={`#${item.number}`}
          containerStyle={{marginHorizontal: 15}}
          position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
          onPress={() => null}
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
