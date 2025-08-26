import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItem,
  ListItemSwipeable,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Realm, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  batteryIsCharged,
  batterySummaryExtended,
  batteryTintIconProps,
  useBatteriesFilter,
} from 'lib/battery';
import { groupItems } from 'lib/sectionList';
import { useConfirmAction } from 'lib/useConfirmAction';
import {
  BatteryFull,
  BatteryLow,
  CircleMinus,
  Funnel,
  FunnelPlus,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { selectFilters } from 'store/selectors/filterSelectors';
import { BatteryTint } from 'types/battery';
import { FilterType } from 'types/filter';
import { BatteriesNavigatorParamList } from 'types/navigation';

type Section = {
  title?: string;
  data: Battery[];
};

export type Props = NativeStackScreenProps<
  BatteriesNavigatorParamList,
  'Batteries'
>;

const BatteriesScreen = ({ navigation, route }: Props) => {
  const { listBatteries } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const headerHeight = useHeaderHeight();
  const { showActionSheetWithOptions } = useActionSheet();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const filterId = useSelector(selectFilters(FilterType.BatteriesFilter));

  const batteries = useBatteriesFilter();
  const activeBatteries = batteries.filtered(
    'retired == $0 AND inStorage == $1',
    false,
    false,
  );
  const retiredBatteries = batteries.filtered('retired == $0', true);
  const inStorageBatteries = batteries.filtered('inStorage == $0', true);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (listBatteries === 'all') {
          return (
            <Button
              title={listEditorState?.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabled={!activeBatteries.length}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              onPress={() => listEditorRef.current?.onToggleEditMode()}
            />
          );
        } else {
          return null;
        }
      },
      headerRight: () => {
        return (
          <>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={
                !filterId &&
                (!activeBatteries.length || listEditorState?.enabled)
              }
              headerRight
              icon={
                filterId ? (
                  <FunnelPlus
                    color={theme.colors.screenHeaderButtonText}
                    size={28}
                  />
                ) : (
                  <Funnel
                    color={theme.colors.screenHeaderButtonText}
                    size={28}
                  />
                )
              }
              onPress={() =>
                navigation.navigate('BatteryFiltersNavigator', {
                  screen: 'BatteryFilters',
                  params: {
                    filterType: FilterType.BatteriesFilter,
                    useGeneralFilter: true,
                  },
                })
              }
            />
            {listBatteries !== 'all' ? (
              <Button
                title={listEditorState?.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                disabled={!retiredBatteries.length}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                onPress={() => listEditorRef.current?.onToggleEditMode()}
              />
            ) : (
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                disabled={listEditorState?.enabled}
                headerRight
                icon={
                  <Plus color={theme.colors.screenHeaderButtonText} size={28} />
                }
                onPress={addBattery}
              />
            )}
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeBatteries,
    filterId,
    inStorageBatteries,
    listEditorState?.enabled,
    retiredBatteries,
  ]);

  const addBattery = () => {
    const haveBatteries =
      !!activeBatteries.length ||
      !!retiredBatteries.length ||
      !!inStorageBatteries.length;
    showActionSheetWithOptions(
      {
        options: ['Add New', 'Add From Template', 'Cancel'],
        disabledButtonIndices: haveBatteries ? [] : [1],
        message: haveBatteries
          ? ''
          : 'Create your first battery. Existing batteries can be used as templates for creating new batteries.',
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

  const deleteBattery = (batteryId: string) => {
    const battery = realm.objectForPrimaryKey(
      'Battery',
      new BSON.ObjectId(batteryId),
    );
    if (battery?.isValid()) {
      realm.write(() => {
        realm.delete(battery);
      });
    }
  };

  const addBatteryCycle = (battery: Battery) => {
    const compatibleBatteries = realm
      .objects(Battery)
      .filtered('_id != $0 AND sCells == $1', battery._id, battery.sCells);

    // If only one battery with similar configuration the skip asking for type of cycle.
    if (!compatibleBatteries.length) {
      return navigation.navigate('NewBatteryCycleNavigator', {
        screen: 'NewBatteryCycle',
        params: {
          batteryIds: [battery._id.toString()],
        },
      });
    }

    showActionSheetWithOptions(
      {
        options: ['Single Cycle', 'Parallel Cycle', 'Cancel'],
        message:
          'Cycle a single battery or multiple batteries in parallel. Batteries must have the same series cell count to cycle in parallel.',
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            navigation.navigate('NewBatteryCycleNavigator', {
              screen: 'NewBatteryCycle',
              params: {
                batteryIds: [battery._id.toString()],
              },
            });
            break;
          case 1:
            navigation.navigate('BatteryPicker', {
              title: 'Parallel Cycle',
              mode: 'many',
              selected: [battery],
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
        },
      });
    } else {
      Alert.alert(
        'No Batteries Selected',
        'At least one battery must be selected to perform a battery cycle.',
      );
    }
  };

  const groupBatteries = (
    batteries: Realm.Results<Battery>,
  ): SectionListData<Battery, Section>[] => {
    return groupItems<Battery, Section>(batteries, battery => {
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
      <ListItemSwipeable
        key={battery._id.toString()}
        title={battery.name}
        subtitle={batterySummaryExtended(battery)}
        subtitleLines={3}
        listEditor={listEditorRef.current}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor:
            battery.tint !== BatteryTint.None
              ? batteryTintIconProps[battery.tint]?.color
              : theme.colors.transparent,
        }}
        titleStyle={s.batteryText}
        subtitleStyle={s.batteryText}
        bottomDividerLeft={55}
        position={listItemPosition(index, section.data.length)}
        leftContentStyle={{ paddingHorizontal: 0 }}
        leftContent={
          batteryIsCharged(battery) ? (
            <BatteryFull
              color={theme.colors.brandPrimary}
              size={50}
              style={s.batteryIcon}
            />
          ) : (
            <BatteryLow
              color={theme.colors.brandPrimary}
              size={50}
              style={s.batteryIcon}
            />
          )
        }
        rightContent={listBatteries === 'all' ? 'info' : 'chevron-right'}
        onPressRight={() =>
          navigation.navigate('BatteryEditor', {
            batteryId: battery._id.toString(),
          })
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
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              const label =
                listBatteries === 'retired'
                  ? 'Delete Retired Battery'
                  : listBatteries === 'in-storage'
                    ? 'Delete In Storage Battery'
                    : 'Delete Battery';
              return confirmAction({
                label,
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this battery?',
              });
            },
            onPress: () => deleteBattery(battery._id.toString()),
          },
        ]}
      />
    );
  };

  const renderInactive = () => {
    return (
      <>
        {listBatteries === 'all' &&
        (retiredBatteries.length || inStorageBatteries.length) ? (
          <>
            <Divider text={'INACTIVE BATTERIES'} />
            {retiredBatteries.length ? (
              <ListItem
                title={'Retired'}
                value={`${retiredBatteries.length}`}
                position={
                  inStorageBatteries.length ? ['first'] : ['first', 'last']
                }
                rightContent={'chevron-right'}
                onPress={() =>
                  navigation.push('Batteries', {
                    listBatteries: 'retired',
                  })
                }
              />
            ) : null}
            {inStorageBatteries.length ? (
              <ListItem
                title={'In Storage'}
                value={`${inStorageBatteries.length}`}
                position={
                  inStorageBatteries.length ? ['last'] : ['first', 'last']
                }
                rightContent={'chevron-right'}
                onPress={() =>
                  navigation.push('Batteries', {
                    listBatteries: 'in-storage',
                  })
                }
              />
            ) : null}
            <Divider />
          </>
        ) : (
          <Divider />
        )}
      </>
    );
  };

  if (!filterId && listBatteries === 'retired' && !retiredBatteries.length) {
    return <EmptyView info message={'No Retired Batteries'} />;
  }

  if (
    !filterId &&
    listBatteries === 'in-storage' &&
    !inStorageBatteries.length
  ) {
    return <EmptyView info message={'No Batteries In Storage'} />;
  }

  if (
    (filterId &&
      listBatteries === 'all' &&
      !activeBatteries.length &&
      !retiredBatteries.length &&
      !inStorageBatteries.length) ||
    (filterId && listBatteries === 'retired' && !retiredBatteries.length) ||
    (filterId && listBatteries === 'in-storage' && !inStorageBatteries.length)
  ) {
    return (
      <EmptyView
        message={'No Batteries Match Your Filter'}
        details={'Adjust your filter settings to see your batteries.'}
        buttonTitle={'Adjust Filter'}
        onButtonPress={() =>
          navigation.navigate('BatteryFiltersNavigator', {
            screen: 'BatteryFilters',
            params: {
              filterType: FilterType.BatteriesFilter,
              useGeneralFilter: true,
            },
          })
        }
      />
    );
  }

  if (
    !filterId &&
    !activeBatteries.length &&
    !retiredBatteries.length &&
    !inStorageBatteries.length
  ) {
    return (
      <EmptyView
        info
        message={'No Batteries'}
        details={'Tap the + button to a add battery.'}
        buttonTitle={'Add Battery'}
        onButtonPress={addBattery}
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
        contentContainerStyle={{ flexGrow: 1, marginBottom: headerHeight }}
        style={theme.styles.view}
        sections={[
          ...groupBatteries(
            listBatteries === 'retired'
              ? retiredBatteries
              : listBatteries === 'in-storage'
                ? inStorageBatteries
                : activeBatteries,
          ),
        ]}
        keyExtractor={item => item._id.toString()}
        renderItem={renderBattery}
        renderSectionHeader={({ section: { title } }) => (
          <View style={theme.styles.listSectionHeader}>
            <Divider text={title} />
          </View>
        )}
        ListFooterComponent={renderInactive()}
      />
    </ListEditor>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  batteryIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  batteryText: {
    left: 10,
    maxWidth: '90%',
  },
  batteryTint: {
    borderLeftWidth: 8,
  },
}));

export default BatteriesScreen;
