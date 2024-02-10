import { AppTheme, useTheme } from 'theme';
import { ListItem, listItemPosition } from 'components/atoms/List';
import { SectionList, SectionListData, SectionListRenderItem } from 'react-native';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';

type Section = {
  title?: string;
  data: BatteryCycle[];
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCycles'>;

const BatteryCyclesScreen = ({ navigation, route }: Props) => {
  const { batteryId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  const groupCycles = (cycles?: BatteryCycle[]): SectionListData<BatteryCycle, Section>[] => {
    return groupItems<BatteryCycle, Section>(cycles || [], (cycle) => {
      const date = cycle.charge?.date || cycle.discharge?.date;
      return date ? DateTime.fromISO(date).toFormat('MMMM yyyy').toUpperCase() : '';
    }).sort();
  };

  const cycleTitle = (cycle: BatteryCycle) => {
    const kind = cycle.charge && cycle.discharge ? 'Full Cycle' : 'Partial Cycle';
    const averageCurrent = 'Average Current ?A';
    const cRating = (battery?.cRating && battery.cRating > 0) ? `(${battery.cRating}C)` : '';
    // return `#${cycle.cycleNumber} ${kind}, ${averageCurrent} ${cRating}`;
    return `#${cycle.cycleNumber} ${kind}`;
  };

  const cycleSubtitle = (cycle: BatteryCycle) => {
    const averageCurrent = 'Average Current ?A';
    const cRating = (battery?.cRating && battery.cRating > 0) ? `(${battery.cRating}C)` : '';
    return `${averageCurrent} ${cRating}\nD:\nC:\nS:`;
  };

  const renderCycle: SectionListRenderItem<BatteryCycle, Section> = ({
    item: cycle,
    section,
    index,
  }: {
    item: BatteryCycle;
    section: Section;
    index: number;
  }) => {
    return (
      <ListItem
        key={index}
        title={cycleTitle(cycle)}
        subtitle={cycleSubtitle(cycle)}
        position={listItemPosition(index, section.data.length)}
        onPress={() => navigation.navigate('BatteryCycle', {
          batteryId,
          cycleNumber: cycle.cycleNumber,
        })}
      />
    )
  };
  
  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={s.sectionList}
        sections={groupCycles(battery?.cycles)}
        keyExtractor={(item, index)=> `${index}${item.cycleNumber}`}
        renderItem={renderCycle}
        renderSectionHeader={({section: {title}}) => (
          <Divider text={title} />
        )}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));


export default BatteryCyclesScreen;
