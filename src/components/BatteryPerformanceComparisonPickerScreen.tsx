import React, { useEffect } from 'react';
import { SectionList, SectionListData, View } from 'react-native';

import {
  Divider,
  ListItemCheckBox,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@realm/react';
import { batterySummaryExtended } from 'lib/battery';
import { groupItems } from 'lib/sectionList';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { Battery } from 'realmdb/Battery';
import { BatteriesNavigatorParamList } from 'types/navigation';

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
  const s = useStyles();
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
        <ListItemCheckBox
          key={index}
          title={battery.name}
          subtitle={batterySummaryExtended(battery)}
          position={listItemPosition(index, section.data.length)}
          checked={true}
          onChange={() => null}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <View style={theme.styles.listSectionHeader}>
          <Divider text={title} />
        </View>
      )}
      ListHeaderComponent={
        <View style={s.listHeader}>
          <Divider
            note
            light
            text={'Choose up to four batteries to compare.'}
          />
        </View>
      }
    />
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
    ...theme.styles.view,
  },
  listHeader: {
    marginTop: 15,
    height: undefined,
  },
}));

export default BatteryPerformanceComparisonPickerScreen;
