import { AppTheme, useTheme } from 'theme';
import { BatteryPickerViewMethods, BatteryPickerViewProps } from './types';
import {
  ListItemCheckbox,
  SectionListHeader,
  listItemPosition,
} from 'components/atoms/List';
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';
import {
  batteryIsCharged,
  batterySummary,
  batteryTintIcons,
} from 'lib/battery';

import { Battery } from 'realmdb/Battery';
import { BatteryTint } from 'types/battery';
import Icon from 'react-native-vector-icons/FontAwesome6';
import React from 'react';
import { groupItems } from 'lib/sectionList';
import lodash from 'lodash';
import { makeStyles } from '@rn-vui/themed';
import { useSetState } from '@react-native-ajp-elements/core';

type Section = {
  title?: string;
  data: Battery[];
};

type BatteryPickerView = BatteryPickerViewMethods;

const BatteryPickerView = React.forwardRef<
  BatteryPickerView,
  BatteryPickerViewProps
>((props, _ref) => {
  const { batteries, favoriteBatteries, mode, selected, onSelect } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const [list, setList] = useSetState<{
    selected: Battery[];
    initial: Battery[];
  }>({
    // Use an empty array if empty string is set.
    selected: lodash.isArrayLike(selected)
      ? selected
      : selected
        ? [selected]
        : [],
    initial: lodash.isArrayLike(selected)
      ? selected
      : selected
        ? [selected]
        : [],
  });

  const toggleSelect = (battery?: Battery) => {
    let selected: Battery[] = [];
    if (mode === 'one') {
      battery ? (selected = [battery]) : (selected = []);
      setList({ selected }, { assign: true });
    } else if (battery) {
      if (
        list.selected.findIndex(
          s => s._id.toString() === battery._id.toString(),
        ) > -1
      ) {
        selected = list.selected.filter(
          s => s._id.toString() !== battery._id.toString(),
        );
        setList({ selected }, { assign: true });
      } else {
        selected = list.selected.concat(battery);
        setList({ selected: list.selected.concat(battery) }, { assign: true });
      }
    }

    onSelect(selected);
  };

  const groupBatteries = (
    batteries: Battery[],
  ): SectionListData<Battery, Section>[] => {
    const groups = groupItems<Battery, Section>(batteries, battery => {
      const c = battery.capacity ? `${battery.capacity}mAh - ` : '';
      const p = battery.pCells > 1 ? `/${battery.pCells}P` : '';
      return `${c}${battery.sCells}S${p} PACKS`;
    }).sort();

    if (favoriteBatteries && favoriteBatteries.length > 0) {
      groups.splice(0, 0, {
        title: 'FAVORITES BATTERIES',
        data: favoriteBatteries as Battery[],
      });
    }
    return groups;
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
          borderLeftColor:
            battery.tint !== BatteryTint.None
              ? batteryTintIcons[battery.tint]?.color
              : theme.colors.transparent,
        }}
        position={listItemPosition(index, section.data.length)}
        checked={
          list.selected.findIndex(
            s => s._id.toString() === battery._id.toString(),
          ) > -1
        }
        leftImage={
          <View>
            <Icon
              name={
                batteryIsCharged(battery) ? 'battery-full' : 'battery-quarter'
              }
              solid={true}
              size={45}
              color={theme.colors.brandPrimary}
              style={s.batteryIcon}
            />
          </View>
        }
        onPress={() => toggleSelect(battery)}
      />
    );
  };

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupBatteries(batteries as Battery[])}
      keyExtractor={item => item._id.toString()}
      renderItem={renderBattery}
      renderSectionHeader={({ section: { title } }) => (
        <SectionListHeader title={title} />
      )}
    />
  );
});

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  batteryIcon: {
    transform: [{ rotate: '-90deg' }],
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

export default BatteryPickerView;
