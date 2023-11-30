import { AppTheme, useTheme } from 'theme';
import { Battery, BatteryChemistry } from 'types/battery';
import React, { useEffect } from 'react';
import { SectionList, SectionListData, Text } from 'react-native';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { Button } from '@rneui/base';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckbox } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native-ui-lib';
import { makeStyles } from '@rneui/themed';

interface Section {
  title: string;
  data: Battery[];
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryPerformanceComparisonPicker'>;

const BatteryPerformanceComparisonPickerScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const batteries: Battery[] = [
    {
      id: '1',
      name: '150S #2',
      chemistry: BatteryChemistry.LiPo,
      vendor: 'Pulse',
      purchasePrice: 10,
      retired: false,
      inStorage: false,
      cRating: 30,
      capacity: 450,
      sCells: 3,
      pCells: 1,
      totalCycles: 4,
      lastCycle: '2023-11-17T03:28:04.651Z',
      notes: '',
    },
    {
      id: '2',
      name: '150S #1',
      chemistry: BatteryChemistry.LiPo,
      vendor: 'Pulse',
      purchasePrice: 10,
      retired: false,
      inStorage: false,
      cRating: 30,
      capacity: 450,
      sCells: 3,
      pCells: 1,
      totalCycles: 4,
      lastCycle: '2023-11-17T03:28:04.651Z',
      notes: '',
    },
    {
      id: '3',
      name: 'Buddy #1',
      chemistry: BatteryChemistry.LiPo,
      vendor: 'Pulse',
      purchasePrice: 60,
      retired: false,
      inStorage: false,
      cRating: 70,
      capacity: 1800,
      sCells: 6,
      pCells: 2,
      totalCycles: 4,
      lastCycle: '2023-11-17T03:28:04.651Z',
      notes: '',
    },
  ];

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
            onPress={navigation.goBack}
          />
        )
      },
      headerRight: ()  => {
        return (
          <Button
            title={'Done'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.doneButton]}
            onPress={onDone}
          />
        )
      },
    });
  }, []);

  const onDone = () => {};

  const groupBatteries = (batteries: Battery[]): SectionListData<Battery, Section>[] => {
    const groupedBatteries: {
      [key in string]: Battery[];
    } = {};

    batteries.forEach((battery, index) => {
      let groupTitle = 'Baseline Battery';
      if (index > 0) {
        if (battery.pCells > 1) {
          groupTitle = `${battery.capacity}mAh - ${battery.sCells}S/${battery.pCells}P Packs`;
        } else {
          groupTitle = `${battery.capacity}mAh - ${battery.sCells}S Packs`;
        }
      }

      groupedBatteries[groupTitle] = groupedBatteries[groupTitle] || [];
      groupedBatteries[groupTitle].push(battery);
    });

    const batteriesSectionData: SectionListData<Battery, Section>[] = [];
    Object.keys(groupedBatteries).forEach(group => {
      batteriesSectionData.push({
        title: group,
        data: groupedBatteries[group],
      });
    });

    return batteriesSectionData;
  };

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={s.sectionList}
      sections={groupBatteries(batteries)}
      keyExtractor={item => item.id}
      renderItem={({item: battery, index, section}) => (
        <ListItemCheckbox
          key={index}
          title={battery.name}
          subtitle={`${battery.capacity}mAh ${battery.sCells}S/${battery.pCells}P ${battery.chemistry}, ${battery.totalCycles} cycles, ${DateTime.fromISO(battery.lastCycle).toFormat("MM/d/yy")} last`}
          containerStyle={{marginHorizontal: 15}}
          position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
          checked={true}
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
      ListHeaderComponent={
        <View style={s.listHeader}>
          <Divider type={'note'} text={'Choose up to four batteries to compare.'} />
        </View>
      }
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
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
    ...theme.styles.textSmall,
    ...theme.styles.textDim
  },
  listHeader: {
    ...theme.styles.view,
    height: undefined,
  },
}));

export default BatteryPerformanceComparisonPickerScreen;
