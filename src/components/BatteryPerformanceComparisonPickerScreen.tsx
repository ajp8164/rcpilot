import { AppTheme, useTheme } from 'theme';
import {
  ListItemCheckbox,
  SectionListHeader,
  listItemPosition,
} from 'components/atoms/List';
import React, { useEffect } from 'react';
import { SectionList, SectionListData, View } from 'react-native';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { batterySummaryExtended } from 'lib/battery';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rn-vui/themed';
import { useQuery } from '@realm/react';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

type Section = {
  title?: string;
  data: Battery[];
};

export type Props = NativeStackScreenProps<
  BatteriesNavigatorParamList,
  'BatteryPerformanceComparisonPicker'
>;

const BatteryPerformanceComparisonPickerScreen = ({
  navigation: _navigation,
}: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const setScreenEditHeader = useScreenEditHeader();

  const batteries = useQuery<Battery>(Battery);

  useEffect(() => {
    const onDone = () => {
      return;
    };
    setScreenEditHeader({ enabled: true, action: onDone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupBatteries = (
    batteries: Realm.Results<Battery>,
  ): SectionListData<Battery, Section>[] => {
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
      renderItem={({ item: battery, index, section }) => (
        <ListItemCheckbox
          key={index}
          title={battery.name}
          subtitle={batterySummaryExtended(battery)}
          containerStyle={s.batteryCheckbox}
          position={listItemPosition(index, section.data.length)}
          checked={true}
          onPress={() => null}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <SectionListHeader title={title} />
      )}
      ListHeaderComponent={
        <View style={s.listHeader}>
          <Divider note text={'Choose up to four batteries to compare.'} />
        </View>
      }
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
  listHeader: {
    ...theme.styles.view,
    height: undefined,
  },
  batteryCheckbox: {
    marginHorizontal: 15,
  },
}));

export default BatteryPerformanceComparisonPickerScreen;
