import { AppTheme, useTheme } from 'theme';
import { ListItemCheckbox, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { SectionList, SectionListData, SectionListRenderItem, View } from 'react-native';
import { batteryIsCharged, batteryTintIcons } from 'lib/battery';

import { Battery } from 'realmdb/Battery';
import { BatteryTint } from 'types/battery';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupItems } from 'lib/sectionList';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useQuery } from '@realm/react';
import { useSetState } from '@react-native-ajp-elements/core';

export type BatteryPickerInterface = {
  mode?: 'one' | 'many';
  title: string;
  backTitle?: string;
  selected?: Battery | Battery[]; // The literal value(s)
  eventName: string;
};

export type BatteryPickerResult = {
  batteries: Battery[];
}

type Section = {
  title?: string;
  data: Battery[];
};

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'BatteryPicker'>;

const BatteryPickerScreen = ({ navigation, route }: Props) => {
  const {
    mode = 'one',
    title,
    backTitle,
    selected,
    eventName,
  } = route.params;
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const activeBatteries = useQuery(Battery, batteries => { return batteries.filtered('retired == $0', false) }, []);

  const [list, setList] = useSetState<{ selected: Battery[]; initial: Battery[]; }>({
     // Use an empty array if empty string is set.
    selected: lodash.isArrayLike(selected) ? selected : selected ? [selected] : [],
    initial: lodash.isArrayLike(selected) ? selected : selected ? [selected] : [],
  });

  useEffect(() => {
    navigation.setOptions({
      title,
      headerBackTitle: backTitle,
    });
  }, []);

  const toggleSelect = (battery?: Battery) => {
    let selected: Battery[] = [];
    if (mode === 'one') {
      battery ? selected = [battery] : selected = [];
      setList({ selected }, {assign: true});
    } else if (battery) {
      if (list.selected.findIndex(s => s._id.toString() === battery._id.toString()) > -1) {
        selected = list.selected.filter(s => s._id.toString() !== battery._id.toString());
        setList({ selected }, {assign: true});
      } else {
        selected = list.selected.concat(battery);
        setList({ selected: list.selected.concat(battery) }, {assign: true});
      }
    }

    event.emit(eventName, {batteries: selected} as BatteryPickerResult);
  };

  const groupBatteries = (batteries: Realm.Results<Battery>): SectionListData<Battery, Section>[] => {
    return groupItems<Battery, Section>(batteries, (battery) => {
      const c = battery.capacity ? `${battery.capacity}mAh - ` : '';
      const p = battery.pCells > 1 ? `/${battery.pCells}P` : '';
      return `${c}${battery.sCells}S${p} PACKS`;
    }).sort();
  };

  const batterySummary = (battery: Battery) => {
    const capacity = `${battery.capacity}mAh`;
    const cells = `${battery.sCells}S/${battery.pCells}P`;
    const chemistry = battery.chemistry;
    const cycles = battery.totalCycles ? `${battery.totalCycles} cycles` : 'no cycles logged';
    return `${capacity} ${cells} ${chemistry}\n${cycles}`;
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
      <ListItemCheckbox
        key={`${index}`}
        title={battery.name}
        subtitle={batterySummary(battery)}
        titleStyle={s.batteryText}
        subtitleStyle={s.batteryText}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor: battery.tint !== BatteryTint.None ? batteryTintIcons[battery.tint]?.color : theme.colors.transparent,
        }}
        position={listItemPosition(index, section.data.length)}
        checked={list.selected.findIndex(s => s._id.toString() === battery._id.toString()) > -1}
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
        onPress={() => toggleSelect(battery)}
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
        sections={groupBatteries(activeBatteries)}
        keyExtractor={item => item._id.toString()}
        renderItem={renderBattery}
        renderSectionHeader={({section: {title}}) => (
          <Divider text={title} />
        )}
        ListEmptyComponent={
          <EmptyView info message={'No Batteries'} details={"Add your first battery on the Batteries tab."} />
        }
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
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
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default BatteryPickerScreen;
