import { AppTheme, useTheme } from 'theme';
import { Pressable, SectionList, SectionListData, SectionListRenderItem, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryTint } from 'types/battery';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { batteryTintIcons } from 'lib/battery';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';

type Section = {
  title?: string;
  data: Battery[];
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'Batteries'>;

const BatteriesScreen = ({ navigation, route }: Props) => {
  const { listBatteries } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const realm = useRealm();

  const activeBatteries = useQuery(Battery, batteries => { return batteries.filtered('retired == $0', false) }, []);
  const retiredBatteries = useQuery(Battery, batteries => { return batteries.filtered('retired == $0', true) }, []);
  const inStorageBatteries = useQuery(Battery, batteries => { return batteries.filtered('inStorage == $0', true) }, []);

  const [listEditModeEnabled, setListEditModeEnabled] = useState(false);
  const [deleteBatteryActionSheetVisible, setDeleteBatteryActionSheetVisible] = useState<Battery>();

  useEffect(() => {
    const onEdit = () => {
      setListEditModeEnabled(!listEditModeEnabled);
    };

    navigation.setOptions({
      headerLeft: () => {
        if (listBatteries === 'all') {
          return (
            <Button
              title={listEditModeEnabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.editButton]}
              disabled={!activeBatteries.length}
              disabledStyle={theme.styles.buttonClearDisabled}
              onPress={onEdit}
            />
          );
        } else {
          return null;
        }
      },
      headerRight: ()  => {
        return (
          <>
            <Pressable
              disabled={listEditModeEnabled}
              onPress={() => navigation.navigate('BatteryFiltersNavigator')}>
              <Icon
                name={'filter'}
                style={[
                  s.headerIcon,
                  listEditModeEnabled ? s.headerIconDisabled : {}
                ]}
              />
            </Pressable>
            {listBatteries !== 'all' ?
              <Button
                title={listEditModeEnabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonClearTitle}
                buttonStyle={[theme.styles.buttonClear, s.editButton]}
                onPress={onEdit}
              />
            :
              <Pressable
                disabled={listEditModeEnabled}
                onPress={() => navigation.navigate('NewBatteryNavigator', {
                  screen: 'NewBattery',
                  params: {}
                })}>
                <Icon
                  name={'plus'}
                  style={[
                    s.headerIcon,
                    listEditModeEnabled ? s.headerIconDisabled : {}
                  ]}
                />
              </Pressable>
            }
          </>
        );
      },
    });
  }, [ listEditModeEnabled ]);

  const confirmDeleteBattery = (battery: Battery) => {
    setDeleteBatteryActionSheetVisible(battery);
  };

  const deleteBattery = (battery: Battery) => {
    realm.write(() => {
      realm.delete(battery);
    });
  };

  const groupBatteries = (batteries: Realm.Results<Battery>): SectionListData<Battery, Section>[] => {
    return groupItems<Battery, Section>(batteries, (battery) => {
      const c = battery.capacity ? `${battery.capacity}mAh - ` : '';
      const p = battery.pCells > 1 ? `/${battery.pCells}P` : '';
      return `${c}${battery.sCells}S${p} PACKS`;
    }).sort();
  };

  const renderItem: SectionListRenderItem<Battery, Section> = ({
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
        key={battery._id.toString()}
        title={battery.name}
        subtitle={'1 flight, last Nov 4, 2023\n0:04:00 total time, 4:00 avg time'}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor: battery.tint !== BatteryTint.None ? batteryTintIcons[battery.tint]?.color : theme.colors.transparent,
        }}
        titleStyle={s.batteryText}
        subtitleStyle={s.batteryText}
        position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
        leftImage={
          <View>
            <Icon
              name={'battery-full'}
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
            navigation.navigate('NewBatteryCycleNavigator', {
              screen: 'NewBatteryCycle',
              params: {
                batteryId: battery._id.toString(),
              }
            });
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
        showEditor={listEditModeEnabled}
        swipeable={{
          rightItems: [{
            icon: 'delete',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmDeleteBattery(battery),
          }]
        }}
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
        sections={groupBatteries(
          listBatteries === 'retired' ?
            retiredBatteries
            : listBatteries === 'in-storage' ?
            inStorageBatteries
            : activeBatteries)}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({section: {title}}) => (
          <Divider text={title} />
        )}
        ListEmptyComponent={
          !retiredBatteries.length && !inStorageBatteries.length ?
            <Text style={s.emptyList}>{'No Batteries'}</Text>
            : null
        }
        ListFooterComponent={
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
        }
      />
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: listBatteries === 'retired' ?
              'Delete Retired Battery'
              : listBatteries === 'in-storage' ?
              'Delete In Storage Battery'
              : 'Delete Battery',
            onPress: () => {
              deleteBattery(deleteBatteryActionSheetVisible!);
              setDeleteBatteryActionSheetVisible(undefined);
            },
          },
          {
            label: 'Cancel' ,
            onPress: () => setDeleteBatteryActionSheetVisible(undefined),
          },
        ]}
        useNativeIOS={true}
        visible={!!deleteBatteryActionSheetVisible}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  batteryIcon: {
    transform: [{rotate: '-90deg'}],
    width: '100%',
    left: -15,
  },
  batteryText: {
    left: 15,
    maxWidth: '90%',
  },
  batteryTint: {
    borderLeftWidth: 8,
  },
  editButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 180,
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  },
  headerIcon: {
    color: theme.colors.brandPrimary,
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
