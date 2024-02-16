import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { ListItem, SectionListHeader, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { ScrollView, SectionList, SectionListData, SectionListRenderItem } from 'react-native';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { Button } from '@rneui/base';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

type Section = {
  title?: string;
  data: BatteryCycle[];
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCycles'>;

const BatteryCyclesScreen = ({ navigation, route }: Props) => {
  const { batteryId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();
  
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  useEffect(() => {  
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <>
            <Button
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={listEditor.enabled || !battery?.cycles.length}
              icon={
                <Icon
                  name={'filter'}
                  style={[s.headerIcon, listEditor.enabled || !battery?.cycles.length ? s.headerIconDisabled : {}]}
                />
              }
              onPress={() => navigation.navigate('BatteryCycleFiltersNavigator', {
                screen: 'BatteryCycleFilters',
              })}
            />
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!battery?.cycles.length}
              onPress={listEditor.onEdit}
            />
          </>
        );
      },
    });
  }, [ listEditor.enabled ]);

  const groupCycles = (cycles?: BatteryCycle[]): SectionListData<BatteryCycle, Section>[] => {
    return groupItems<BatteryCycle, Section>(cycles || [], (cycle) => {
      const date = cycle.charge?.date || cycle.discharge?.date;
      return date ? DateTime.fromISO(date).toFormat('MMMM yyyy').toUpperCase() : '';
    });
  };

  const cycleTitle = (cycle: BatteryCycle) => {
    const kind = (cycle.charge && cycle.discharge) ? 'Full Cycle' : 'Partial Cycle (Discharge Only)';
    const averageCurrent = 'Average Current ?A';
    const cRating = (battery?.cRating && battery.cRating > 0) ? `(${battery.cRating}C)` : '';
    // return `#${cycle.cycleNumber} ${kind}, ${averageCurrent} ${cRating}`;
    return `#${cycle.cycleNumber}: ${kind}`;
  };

  const cycleSubtitle = (cycle: BatteryCycle) => {
    const averageCurrent = 'Average Current ?A';
    const cRating = (battery?.cRating && battery.cRating > 0) ? `(${battery.cRating}C)` : '';
    const notes = cycle.notes ? `\n\n${cycle.notes}` : '';
    return `${averageCurrent} ${cRating}\nD:\nC:\nS:${notes}`;
  };

  const deleteCycle = (cycleNumber: number) => {
    realm.write(() => {
      const index = battery?.cycles.findIndex(c => c.cycleNumber === cycleNumber);
      if (index !== undefined && index >= 0) {
        // Make sure to decrement the battery's total cycle count.
        battery?.cycles.splice(index, 1);
        battery!.totalCycles = battery!.totalCycles! - 1;
      }
    });
  };

  const renderBatteryCycle: SectionListRenderItem<BatteryCycle, Section> = ({
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
        ref={ref => listEditor.add(ref, 'battery-cycles', index)}
        key={index}
        title={cycleTitle(cycle)}
        subtitle={cycleSubtitle(cycle)}
        position={listItemPosition(index, section.data.length)}
        onPress={() => navigation.navigate('BatteryCycleEditor', {
          batteryId,
          cycleNumber: cycle.cycleNumber,
        })}
        editable={{
          item: {
            icon: 'remove-circle',
            color: theme.colors.assertive,
            action: 'open-swipeable',
          },
          reorder: true,
        }}
        showEditor={listEditor.show}
        swipeable={{
          rightItems: [{
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmAction('Delete Cycle', cycle.cycleNumber, deleteCycle),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('battery-cycles', index)}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  if (!battery) {
    return (<EmptyView error message={'Battery not found!'} />);
  }

  return (
    <ScrollView style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <SectionList
        scrollEnabled={false}
        stickySectionHeadersEnabled={true}
        style={s.sectionList}
        sections={groupCycles([...battery?.cycles].reverse())} // Latest cycles at the top
        keyExtractor={(item, index)=> `${index}${item.cycleNumber}`}
        renderItem={renderBatteryCycle}
        renderSectionHeader={({section: {title}}) => (
          <SectionListHeader title={title} />
        )}
        ListFooterComponent={<Divider />}
        ListEmptyComponent={
          <EmptyView info message={'No battery cycles'} details={'Tap the battery on the Batteries tab to add a new cycle.'} />
        }
      />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
    marginHorizontal: 10,
  },
  headerIconDisabled: {
    color: theme.colors.disabled,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));


export default BatteryCyclesScreen;
