import { AppTheme, useTheme } from 'theme';
import { Battery, BatteryChemistry } from 'types/battery';
import React, { useEffect, useState } from 'react';
import { SectionList, SectionListData, Text, View } from 'react-native';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { FlightNavigatorParamList } from 'types/navigation';
import { ListItemCheckbox } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { batteryCellConfigurationToString } from 'lib/battery';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<FlightNavigatorParamList, 'FlightBatteries'>;

const FlightBatteriesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const batteries = [{
      id: '1',
      name: '150S #1',
      chemistry: BatteryChemistry.LiPo,
      vendor: '',
      purchasePrice: 0,
      retired:  false,
      inStorage: false,
      cRating: 30,
      capacity: 450,
      sCells: 3,
      pCells: 1,
      totalCycles: 3,
      lastCycle: '2023-11-17T03:28:04.651Z',
      notes: '',
    }   
  ];

  const favoriteBatteries = batteries;
  const [cancelFlightActionSheetVisible, setCancelFlightActionSheetVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={[theme.styles.buttonClearTitle, s.headerButton]}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={() => setCancelFlightActionSheetVisible(true)}
        />
      ),
      headerRight: () => (
        <Button
          title={'Done'}
          titleStyle={[theme.styles.buttonClearTitle, s.headerButton]}
          buttonStyle={[theme.styles.buttonClear, s.doneButton]}
          onPress={() => navigation.navigate('FlightPreFlight', {
            flightId: '1',
          })}
        />
      ),
    });
  }, []);

  const groupBatteries = (batteries: Battery[]): SectionListData<Battery>[] => {
    const groupedBatteries: {
      [key in string]: Battery[];
    } = {};

    batteries.forEach(battery => {
      const groupTitle = `${battery.capacity}MAH - ${battery.sCells} PACKS`;

      groupedBatteries[groupTitle] = groupedBatteries[groupTitle] || [];
      groupedBatteries[groupTitle].push(battery);
    });

    const batteriesSectionData: SectionListData<Battery>[] = [];
    Object.keys(groupedBatteries).forEach(group => {
      batteriesSectionData.push({
        title: group,
        data: groupedBatteries[group],
      });
    });

    return batteriesSectionData;
  };

  return (
    <View style={theme.styles.view}>
      <Divider text={'FAVORITES'}/>
      {favoriteBatteries.map((battery, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={battery.name}
            subtitle={`${battery.capacity}mAh, ${batteryCellConfigurationToString(battery)}, ${battery.cRating}C, ${battery.chemistry}, ${battery.totalCycles} cycles, ${DateTime.fromISO(battery.lastCycle).toFormat('MM/dd/yyyy')} last`}
            checked={false}
            position={favoriteBatteries.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === favoriteBatteries.length - 1 ? ['last'] : []}
            onPress={() => null} 
           /> 
        );
      })}
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
            subtitle={`${battery.capacity}mAh, ${batteryCellConfigurationToString(battery)}, ${battery.cRating}C, ${battery.chemistry}, ${battery.totalCycles} cycles, ${DateTime.fromISO(battery.lastCycle).toFormat('MM/dd/yyyy')} last`}
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
      />
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: 'Do Not Log Flight',
            onPress: () => navigation.goBack(),
          },
          { label: 'Cancel' },
        ]}
        useNativeIOS={true}
        visible={cancelFlightActionSheetVisible}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    color: theme.colors.stickyWhite,
  },
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
    paddingHorizontal: 10,
    backgroundColor: theme.colors.listHeaderBackground,
  },
  sectionHeader: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim
  },
}));

export default FlightBatteriesScreen;
