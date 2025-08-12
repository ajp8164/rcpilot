import { useSetState } from '@react-native-hello/core';
import { Divider } from '@react-native-hello/ui';
import { ListItem, ListItemCheckBox } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRealm } from '@realm/react';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import lodash from 'lodash';
import React, { ReactElement, useEffect } from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { BSON } from 'realm';
import { useTheme } from 'theme';
import { MultipleNavigatorParamList } from 'types/navigation';

export type EnumPickerIconProps = {
  hideTitle?: boolean;
  leftContent?: ReactElement;
  name?: string;
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

export type Props = NativeStackScreenProps<
  MultipleNavigatorParamList,
  'EnumPicker'
>;

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
    const canSubmit = !lodash.isEmpty(lodash.xor(list.selected, list.initial));

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
      setScreenEditHeader({ enabled: canSubmit, action: onDone });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const toggleSelect = (value?: string) => {
    if (mode === 'one' || mode === 'one-or-none') {
      value
        ? setList({ selected: [value] })
        : setList({ selected: [] }, { assign: true });
    } else if (value) {
      if (list.selected.includes(value)) {
        setList(
          { selected: list.selected.filter(v => v !== value) },
          { assign: true },
        );
      } else {
        setList({ selected: list.selected.concat(value) }, { assign: true });
      }
    }

    // For single selection mode we send the selected value immediately.
    if (mode === 'one' || mode === 'one-or-none') {
      event.emit(eventName, {
        value: value ? [value] : [],
      } as EnumPickerResult);
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
    return icons && icons[value] ? (
      <View key={value}>{icons[value]?.leftContent}</View>
    ) : undefined;
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
      <ListItemCheckBox
        key={`${value}${index}`}
        title={icons && icons[value]?.hideTitle ? '' : name}
        leftContent={getIconEl(value)}
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
        onChange={() => toggleSelect(value)}
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
            position={['first']}
            onPress={selectAll}
          />
          <ListItem
            title={'Select None'}
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
        <ListItemCheckBox
          title={'None'}
          position={list.values.length === 0 ? ['first', 'last'] : ['last']}
          checked={!list.selected.length}
          onChange={() => toggleSelect()}
        />
      )}
      {mode === 'many-or-none' && (
        <>
          <Divider />
          <ListItemCheckBox
            title={'Unspecified'}
            position={['first', 'last']}
            checked={list.selected[0] === 'Unspecified'}
            onChange={selectUnspecified}
          />
        </>
      )}
      <Divider
        note
        light
        subHeaderStyle={theme.styles.textSmall}
        text={footer}
      />
    </ScrollView>
  );
};

export default EnumPickerScreen;
