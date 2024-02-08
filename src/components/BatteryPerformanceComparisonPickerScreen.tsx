import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';
import { SectionList, SectionListData, Text } from 'react-native';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckbox } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native-ui-lib';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { useQuery } from '@realm/react';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

type Section = {
  title?: string;
  data: Battery[];
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryPerformanceComparisonPicker'>;

const BatteryPerformanceComparisonPickerScreen = ({ navigation: _navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const setScreenEditHeader = useScreenEditHeader();

  const batteries = useQuery<Battery>(Battery);

  useEffect(() => {
    const onDone = () => {};
    setScreenEditHeader(true, onDone);
  }, []);

  const groupBatteries = (batteries: Realm.Results<Battery>): SectionListData<Battery, Section>[] => {
    return groupItems<Battery, Section>(batteries, (battery, index) => {
      let groupTitle = 'Baseline Battery';
      if (index > 0) {
        if (battery.pCells > 1) {
          groupTitle = `${battery.capacity}mAh - ${battery.sCells}S/${battery.pCells}P Packs`;
        } else {
          groupTitle = `${battery.capacity}mAh - ${battery.sCells}S Packs`;
        }
      }
      return groupTitle.toUpperCase();
    }).sort();
  };

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={s.sectionList}
      sections={groupBatteries(batteries)}
      keyExtractor={item => item._id.toString()}
      renderItem={({item: battery, index, section}) => (
        <ListItemCheckbox
          key={index}
          title={battery.name}
          subtitle={`${battery.capacity}mAh ${battery.sCells}S/${battery.pCells}P ${battery.chemistry}, ${battery.totalCycles} cycles, ${battery.lastCycle ? DateTime.fromISO(battery.lastCycle).toFormat("MM/d/yy"): 'No'} last`}
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
