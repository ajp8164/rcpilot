import { AppTheme, useTheme } from 'theme';
import { Divider, getColoredSvg, getSvg } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { ListItem, ListItemCheckbox } from 'components/atoms/List';
import React, { useEffect } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SvgXml } from 'react-native-svg';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSetState } from '@react-native-ajp-elements/core';
import { useRealm } from '@realm/react';
import { BSON } from 'realm';

export type EnumPickerIconProps = {
  type?: 'icon' | 'svg';
  name: string | string[];
  color?: string;
  size?: number;
  // Should be typed StyleProp<TextStyle>, not working
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any;
  hideTitle?: boolean;
} | null;

export type EnumPickerInterface = {
  enumName?: string; // Only required for realm objects
  mode?: 'one' | 'one-or-none' | 'many' | 'many-or-none' | 'many-with-actions';
  title: string;
  headerBackTitle?: string;
  icons?: { [key in string]: EnumPickerIconProps }; // Key is a enum value as 'name:id'
  sectionName?: string;
  footer?: string;
  values: string[];
  selected?: string | string[]; // The literal value(s) as 'name:id'
  eventName: string;
};

export type EnumPickerResult = {
  value: string[];
};

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'EnumPicker'>;

const EnumPickerScreen = ({ route, navigation }: Props) => {
  const {
    enumName,
    mode = 'one',
    title,
    headerBackTitle,
    icons,
    sectionName,
    footer,
    values,
    selected,
    eventName,
  } = route.params;
  const theme = useTheme();
  const s = useStyles(theme);

  const event = useEvent();
  const realm = useRealm();
  const setScreenEditHeader = useScreenEditHeader();

  // All of these strings are object ids or enum values.
  const [list, setList] = useSetState<{
    values: string[];
    selected: string[];
    initial: string[];
  }>({
    values,
    // Use an empty array if empty string is set.
    selected: lodash.isString(selected) ? [selected] : selected ? selected : [],
    initial: lodash.isString(selected) ? [selected] : selected ? selected : [],
  });

  useEffect(() => {
    // Check if arrays contain the same elements.
    const canSave = !lodash.isEmpty(lodash.xor(list.selected, list.initial));

    const onDone = () => {
      // For multi-selection mode we send the selected values only when done.
      if (mode.includes('many')) {
        event.emit(eventName, { value: list.selected } as EnumPickerResult);
        navigation.goBack();
      }
    };

    navigation.setOptions({
      title,
      headerBackTitle,
    });

    if (mode === 'many-or-none' || mode === 'many-with-actions') {
      setScreenEditHeader({ enabled: canSave, action: onDone });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const toggleSelect = (value?: string) => {
    if (mode === 'one' || mode === 'one-or-none') {
      value ? setList({ selected: [value] }) : setList({ selected: [] }, { assign: true });
    } else if (value) {
      if (list.selected.includes(value)) {
        setList({ selected: list.selected.filter(v => v !== value) }, { assign: true });
      } else {
        setList({ selected: list.selected.concat(value) }, { assign: true });
      }
    }

    // For single selection mode we send the selected value immediately.
    if (mode === 'one' || mode === 'one-or-none') {
      event.emit(eventName, { value: value ? [value] : [] } as EnumPickerResult);
    }
  };

  const selectAll = () => {
    setList({ selected: list.values }, { assign: true });
  };

  const selectNone = () => {
    setList({ selected: [] }, { assign: true });
  };

  const selectUnspecified = () => {
    setList({ selected: ['Unspecified'] }, { assign: true });
  };

  const getIconEl = (value: string) => {
    // If icons are specified then create an array of icon elements.
    const iconArr: JSX.Element[] = [];
    if (icons && icons[value]) {
      let name = icons[value]?.name || '';
      let el;
      name = lodash.isArray(name) ? name : [name]; // Icon names must be an array.
      name.forEach((n, index) => {
        if (icons[value]?.type === 'svg') {
          el = (
            <SvgXml
              key={index}
              xml={icons[value]?.color ? getColoredSvg(n) : getSvg(n)}
              color={icons[value]?.color}
              width={icons[value]?.size || 20}
              height={icons[value]?.size || 20}
              style={icons[value]?.style}
            />
          );
        } else {
          el = (
            <Icon
              key={index}
              name={n}
              color={icons[value]?.color || theme.colors.midGray}
              size={icons[value]?.size || 20}
              style={icons[value]?.style}
            />
          );
        }
        iconArr.push(el);
      });
    }
    return iconArr.length ? <View style={s.iconArr}>{iconArr}</View> : undefined;
  };

  const renderValue: ListRenderItem<string> = ({ item: value, index }) => {
    let name = value;
    let objId;
    try {
      objId = new BSON.ObjectId(new BSON.ObjectId(value));
    } catch (e) {
      // Using exception to determine if value is a valid object id.
    }

    if (enumName && objId) {
      const enumObj = realm.objectForPrimaryKey(enumName, objId);
      if (!enumObj) {
        // Nothing to render if no enum object is found. Was it deleted?
        return null;
      }
      name = enumObj.name as string;
    }

    return (
      <ListItemCheckbox
        key={`${value}${index}`}
        title={icons && icons[value]?.hideTitle ? '' : name}
        leftImage={getIconEl(value)}
        position={
          mode === 'one-or-none'
            ? index === 0
              ? ['first']
              : []
            : list.values.length === 1
              ? ['first', 'last']
              : index === 0
                ? ['first']
                : index === list.values.length - 1
                  ? ['last']
                  : []
        }
        checked={list.selected?.includes(value)}
        onPress={() => toggleSelect(value)}
      />
    );
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      {(mode === 'many-with-actions' || mode === 'many-or-none') && (
        <>
          <Divider text={'ACTIONS'} />
          <ListItem
            title={'Select All'}
            rightImage={false}
            position={['first']}
            onPress={selectAll}
          />
          <ListItem
            title={'Select None'}
            rightImage={false}
            position={['last']}
            onPress={selectNone}
          />
        </>
      )}
      <Divider text={sectionName} />
      <FlatList
        data={list.values}
        renderItem={renderValue}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
      {mode === 'one-or-none' && (
        <ListItemCheckbox
          title={'None'}
          position={list.values.length === 0 ? ['first', 'last'] : ['last']}
          checked={!list.selected.length}
          onPress={() => toggleSelect()}
        />
      )}
      {mode === 'many-or-none' && (
        <>
          <Divider />
          <ListItemCheckbox
            title={'Unspecified'}
            position={['first', 'last']}
            checked={list.selected[0] === 'Unspecified'}
            onPress={selectUnspecified}
          />
        </>
      )}
      <Divider note text={footer} />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  iconArr: {
    flexDirection: 'row',
  },
}));

export default EnumPickerScreen;
