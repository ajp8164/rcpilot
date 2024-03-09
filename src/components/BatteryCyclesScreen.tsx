import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { ListItem, SectionListHeader, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { SectionList, SectionListData, SectionListRenderItem } from 'react-native';
import { batteryCycleDescription, batteryCycleTitle, useBatteryCyclesFilter } from 'lib/batteryCycle';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { Button } from '@rneui/base';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useSelector } from 'react-redux';

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

  const filterId = useSelector(selectFilters).batteryCycleFilterId;
  const batteryCycles = useBatteryCyclesFilter(batteryId);
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  useEffect(() => {  
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!filterId && listEditor.enabled}
              icon={
                <CustomIcon
                  name={filterId ? 'filter-check' : 'filter'}
                  style={[s.headerIcon,
                    !filterId && listEditor.enabled ? s.headerIconDisabled : {}
                  ]}
                />
              }
              onPress={() => navigation.navigate('BatteryCycleFiltersNavigator', {
                screen: 'BatteryCycleFilters',
              })}
            />
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!batteryCycles.length}
              onPress={listEditor.onEdit}
            />
          </>
        );
      },
    });
  }, [ filterId, listEditor.enabled ]);

  const groupCycles = (cycles?: BatteryCycle[]): SectionListData<BatteryCycle, Section>[] => {
    return groupItems<BatteryCycle, Section>(cycles || [], (cycle) => {
      const date = cycle.charge?.date || cycle.discharge?.date;
      return date ? DateTime.fromISO(date).toFormat('MMMM yyyy').toUpperCase() : '';
    });
  };

  const deleteCycle = (cycleNumber: number) => {
    realm.write(() => {
      const index = batteryCycles.findIndex(c => c.cycleNumber === cycleNumber);
      if (index !== undefined && index >= 0) {
        // Make sure to decrement the battery's total cycle count.
        realm.delete(batteryCycles[index]);
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
        ref={ref => ref && listEditor.add(ref, 'battery-cycles', cycle._id.toString())}
        key={index}
        title={batteryCycleTitle(cycle)}
        subtitle={batteryCycleDescription(cycle)}
        subtitleStyle={[theme.styles.textTiny, theme.styles.textDim]}
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
            ...swipeableDeleteItem[theme.mode],
            onPress: () => confirmAction(deleteCycle, {
              label: 'Delete Cycle',
              title: 'This action cannot be undone.\nAre you sure you want to delete this battery cycle?',
              value: cycle.cycleNumber,
            })
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('battery-cycles', cycle._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  if (!battery) {
    return (<EmptyView error message={'Battery not found!'} />);
  }

  if (filterId && !batteryCycles.length) {
    return (
      <EmptyView message={'No Battery Cycles Match Your Filter'} />
    );
  }

  if (!batteryCycles.length) {
    return (
      <EmptyView info message={'No Battery Cycles'} details={'Tap the battery on the Batteries tab to add a new cycle.'} />
    );    
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupCycles([...batteryCycles].reverse())} // Most recent cycles at the top
      keyExtractor={(item, index)=> `${index}${item.cycleNumber}`}
      renderItem={renderBatteryCycle}
      renderSectionHeader={({section: {title}}) => (
        <SectionListHeader title={title} />
      )}
      ListFooterComponent={<Divider />}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
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
