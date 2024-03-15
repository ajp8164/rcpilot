import { Alert, SectionList, SectionListData, SectionListRenderItem, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { ListItem, SectionListHeader, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { batteryIsCharged, batteryTintIcons, useBatteriesFilter } from 'lib/battery';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryTint } from 'types/battery';
import { Button } from '@rneui/base';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterType } from 'types/filter';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useRealm } from '@realm/react';
import { useSelector } from 'react-redux';

type Section = {
  title?: string;
  data: Battery[];
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'Batteries'>;

const BatteriesScreen = ({ navigation, route }: Props) => {
  const { listBatteries } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const { showActionSheetWithOptions } = useActionSheet();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const filterId = useSelector(selectFilters(FilterType.BatteriesFilter));

  const batteries = useBatteriesFilter();
  const activeBatteries = batteries.filtered('retired == $0 AND inStorage == $1', false, false);
  const retiredBatteries = batteries.filtered('retired == $0', true);
  const inStorageBatteries = batteries.filtered('inStorage == $0', true);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (listBatteries === 'all') {
          return (
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabled={!activeBatteries.length}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              onPress={listEditor.onEdit}
            />
          );
        } else {
          return null;
        }
      },
      headerRight: ()  => {
        return (
          <>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!filterId && (!activeBatteries.length || listEditor.enabled)}
              icon={
                <CustomIcon
                  name={filterId ? 'filter-check' : 'filter'}
                  style={[s.headerIcon,
                    !filterId && (!activeBatteries.length || listEditor.enabled) ? s.headerIconDisabled : {}
                  ]}
                />
              }
              onPress={() => navigation.navigate('BatteryFiltersNavigator', {
                screen: 'BatteryFilters',
                params: {
                  filterType: FilterType.BatteriesFilter,
                  useGeneralFilter: true,
                }
              })}
            />
            {listBatteries !== 'all' ?
              <Button
                title={listEditor.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                disabled={!retiredBatteries.length}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                onPress={listEditor.onEdit}
              />
            :
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                disabled={listEditor.enabled}
                icon={
                  <Icon
                    name={'plus'}
                    style={[s.headerIcon, listEditor.enabled ? s.headerIconDisabled : {}]}
                  />
                }
                onPress={addBattery}
              />
            }
          </>
        );
      },
    });
  }, [
    activeBatteries,
    filterId,
    inStorageBatteries,
    listEditor.enabled,
    retiredBatteries,
  ]);

  const addBattery = () => {
    const haveBatteries = !!activeBatteries.length || !!retiredBatteries.length || !!inStorageBatteries.length;
    showActionSheetWithOptions(
      {
        options: ['Add New', 'Add From Template', 'Cancel'],
        disabledButtonIndices: haveBatteries ? [] : [1],
        message: haveBatteries ? '' : 'Create your first battery. Existing batteries can be used as templates for creating new batteries.',
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            navigation.navigate('NewBatteryNavigator', {
              screen: 'NewBattery',
              params: {},
            });
          break;
          case 1:
            navigation.navigate('BatteryTemplates');
            break;
          default:
            break;
        }
      },
    );
  };

  const deleteBattery = (battery: Battery) => {
    realm.write(() => {
      realm.delete(battery);
    });
  };

  const addBatteryCycle = (battery: Battery) => {
    const compatibleBatteries = realm.objects(Battery).filtered('_id != $0 AND sCells == $1', battery._id, battery.sCells);

    // If only one battery with similar configuration the skip asking for type of cycle.
    if (!compatibleBatteries.length) {
      return navigation.navigate('NewBatteryCycleNavigator', {
        screen: 'NewBatteryCycle',
        params: {
          batteryIds: [battery._id.toString()],
        }
      });
    }

    showActionSheetWithOptions(
      {
        options: ['Single Cycle', 'Parallel Cycle', 'Cancel'],
        message: 'Cycle a single battery or multiple batteries in parallel. Batteries must have the same configuration to cycle in parallel.',
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            navigation.navigate('NewBatteryCycleNavigator', {
              screen: 'NewBatteryCycle',
              params: {
                batteryIds: [battery._id.toString()],
              }
            });
          break;
          case 1:
            navigation.navigate('BatteryPicker', {
              title: 'Parallel Cycle',
              mode: 'many',
              selected: battery,
              query: `sCells == ${battery.sCells}`,
              onDone: onPerformParallelCycle,
            });
            break;
          default:
            break;
        }
      },
    );
  };

  const onPerformParallelCycle = (batteries: Battery[]) => {
    if (batteries.length) {
      navigation.navigate('NewBatteryCycleNavigator', {
        screen: 'NewBatteryCycle',
        params: {
          batteryIds: batteries.map(b => b._id.toString()),
        }
      });
    } else {
      Alert.alert(
        'No Batteries Selected',
        'At least one battery must be selected to perform a battery cycle.'
      );
    }
  };

  const batterySummary = (battery: Battery) => {
    const capacity = `${battery.capacity}mAh`;
    const cells = `${battery.sCells}S/${battery.pCells}P`;
    const chemistry = battery.chemistry;
    const cycles = `${battery.totalCycles ? battery.totalCycles : 'No'} cycles`;
    const lastCycle = battery.cycles[battery.cycles.length - 1];
    const lastCycleInfo = lastCycle ? (
      lastCycle.charge
        ? `Charged on ${DateTime.fromISO(lastCycle.charge.date).toFormat('M/d/yyyy')}`
        : lastCycle.discharge
        ? `Discharged on ${DateTime.fromISO(lastCycle.discharge.date).toFormat('M/d/yyyy')}`
        : 'No cycles are logged'
    ) : 'No cycles are logged';
    
    return `${capacity} ${cells} ${chemistry}\n${cycles}\n${lastCycleInfo}`;
  };

  const groupBatteries = (batteries: Realm.Results<Battery>): SectionListData<Battery, Section>[] => {
    return groupItems<Battery, Section>(batteries, (battery) => {
      if (batteryIsCharged(battery)) {
        const c = battery.capacity ? `${battery.capacity}mAh - ` : '';
        const p = battery.pCells > 1 ? `/${battery.pCells}P` : '';
        return `${c}${battery.sCells}S${p} PACKS`;
      } else {
        return 'READY TO CHARGE';
      }
    }).sort();
  };

  const renderBattery: SectionListRenderItem<Battery, Section> = ({
    item: battery,
    section,
    index,
  }: {
    item: Battery;
    section: Section;
    index: number;
  }) => {
    return (
      <ListItem
        ref={ref => ref && listEditor.add(ref, 'batteries', battery._id.toString())}
        key={battery._id.toString()}
        title={battery.name}
        subtitle={batterySummary(battery)}
        subtitleNumberOfLines={3}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor: battery.tint !== BatteryTint.None ? batteryTintIcons[battery.tint]?.color : theme.colors.transparent,
        }}
        titleStyle={s.batteryText}
        subtitleStyle={s.batteryText}
        bottomDividerLeft={72}
        position={listItemPosition(index, section.data.length)}
        leftImage={
          <View>
            <Icon
              name={batteryIsCharged(battery) ? 'battery-full' : 'battery-quarter'}
              solid={true}
              size={45}
              color={theme.colors.brandPrimary}
              style={s.batteryIcon}
            />
          </View>
        }
        onPress={() => {
          if (listBatteries !== 'all') {
            navigation.navigate('BatteryEditor', {
              batteryId: battery._id.toString(),
            });
          } else {
            addBatteryCycle(battery);
          }
        }}
        showInfo={listBatteries === 'all'}
        onPressInfo={() => navigation.navigate('BatteryEditor', {
          batteryId: battery._id.toString(),
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
            onPress: () => {
              const label = listBatteries === 'retired'
                ? 'Delete Retired Battery'
                : listBatteries === 'in-storage'
                ? 'Delete In Storage Battery'
                : 'Delete Battery';
              confirmAction(deleteBattery, {
                label,
                title: 'This action cannot be undone.\nAre you sure you want to delete this battery?',
                value: battery,
              });
            }
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('batteries', battery._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
     />
    )
  };

  const renderInactive = () => {
    return (
      <>
      {listBatteries === 'all' && (retiredBatteries.length || inStorageBatteries.length)
        ?
          <>
            <Divider text={'INACTIVE BATTERIES'} />
            {retiredBatteries.length ?
              <ListItem
                title={'Retired'}
                value={`${retiredBatteries.length}`}
                position={inStorageBatteries.length ? ['first'] : ['first', 'last']}
                onPress={() => navigation.push('Batteries', {
                  listBatteries: 'retired',
                })}
              />
            : null}
            {inStorageBatteries.length ?
              <ListItem
                title={'In Storage'}
                value={`${inStorageBatteries.length}`}
                position={inStorageBatteries.length ? ['last'] : ['first', 'last']}
                onPress={() => navigation.push('Batteries', {
                  listBatteries: 'in-storage',
                })}
              />
            : null}
            <Divider />
          </>
        :
          <Divider />
      }
      </>
    );
  };

  if (!filterId && listBatteries === 'retired' && !retiredBatteries.length) {
    return (
      <EmptyView info message={'No Retired Batteries'} />
    );
  }

  if (!filterId && listBatteries === 'in-storage' && !inStorageBatteries.length) {
    return (
      <EmptyView info message={'No Batteries In Storage'} />
    );
  }

  if (
    (filterId && listBatteries === 'all' && !activeBatteries.length && !retiredBatteries.length && !inStorageBatteries.length) ||
    (filterId && listBatteries === 'retired' && !retiredBatteries.length) ||
    (filterId && listBatteries === 'in-storage' &&!inStorageBatteries.length)) {
    return (
      <EmptyView message={'No Batteries Match Your Filter'} />
    );
  }

  if (!filterId && !activeBatteries.length && !retiredBatteries.length && !inStorageBatteries.length) {
    return (
      <EmptyView info message={'No Batteries'} details={"Tap the + button to add your first battery."} />
    );
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupBatteries(
        listBatteries === 'retired' ?
          retiredBatteries
          : listBatteries === 'in-storage' ?
          inStorageBatteries
          : activeBatteries)}
      keyExtractor={item => item._id.toString()}
      renderItem={renderBattery}
      renderSectionHeader={({section: {title}}) => (
        <SectionListHeader title={title} />
      )}
      ListFooterComponent={renderInactive()}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  batteryIcon: {
    transform: [{rotate: '-90deg'}],
    width: '100%',
    left: -8,
  },
  batteryText: {
    left: 15,
    maxWidth: '90%',
  },
  batteryTint: {
    borderLeftWidth: 8,
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

export default BatteriesScreen;
