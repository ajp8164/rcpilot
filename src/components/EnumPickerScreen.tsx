import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { ListItem, ListItemCheckbox } from 'components/atoms/List';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useSetState } from '@react-native-ajp-elements/core';

export type EnumPickerIconProps = {
  name: string | string[];
  color?: string;
  size?: number;
  // @ts-ignore: should be typed StyleProp<TextStyle>, not working
  style?: any;
  hideTitle?: boolean;
} | null;

export type EnumPickerInterface = {
  mode?: 'one' | 'one-or-none' | 'many' | 'many-or-none' | 'many-with-actions';
  title: string;
  headerBackTitle?: string;
  icons?: {[key in string]: EnumPickerIconProps}; // Key is a enum value
  sectionName?: string;
  footer?: string;
  values: string[];
  selected?: string | string[]; // The literal value(s)
  eventName: string;
};

export type EnumPickerResult = {
  value: string[];
}

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'EnumPicker'>;

const EnumPickerScreen = ({ route,  navigation }: Props) => {
  const {
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

  const [list, setList] = useSetState<{ values: string[]; selected: string[]; initial: string[]; }>({
    values,
     // Use an empty array if empty string is set.
    selected: lodash.isArray(selected) ? selected : selected ? [selected] : [],
    initial: lodash.isArray(selected) ? selected : selected ? [selected] : [],
  });

  useEffect(() => {
    const canSave = () => {
      // Check if arrays contain the same elements.
      return (!lodash.isEmpty(lodash.xor(list.selected, list.initial)));
    };

    const onDone = () => {
      // For multi-selection mode we send the selected values only when done.
      if (mode.includes('many')) {
        event.emit(eventName, {value: list.selected} as EnumPickerResult);
        navigation.goBack();
      }
    };
  
    navigation.setOptions({
      title,
      headerBackTitle,
    });

    if (mode === 'many-or-none' || mode === 'many-with-actions') {
      navigation.setOptions({
        headerLeft: () => {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
              onPress={navigation.goBack}
            />
          )
        },
        headerRight: ()  => {
          if (canSave()) {
            return (
              <Button
                title={'Done'}
                titleStyle={theme.styles.buttonClearTitle}
                buttonStyle={[theme.styles.buttonClear, s.doneButton]}
                onPress={onDone}
              />
            )
          };
        },
      });
    }
  }, [ list ]);

  const toggleSelect = (value?: string) => {
    if (mode === 'one') {
      value ? setList({ selected: [value] }) : setList({ selected: [] }, {assign: true});
    } else if (value) {
      if (list.selected.includes(value)) {
        setList({ selected: list.selected.filter(v => v !== value) }, {assign: true});
      } else {
        setList({ selected: list.selected.concat(value) }, {assign: true});
      }
    }

    // For single selection mode we send the selected value immediately.
    if (mode === 'one' || mode === 'one-or-none') {
      event.emit(eventName, {value: [value]} as EnumPickerResult);
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
    let iconArr: JSX.Element[] | undefined  = undefined;
    if (icons && icons[value]) {
      iconArr = [];
      let name = icons[value]!.name;
      name = lodash.isArray(name) ? name : [name]; // Icon names must be an array.
      name.forEach((n, index) => {
        iconArr!.push(
          <Icon
            key={index}
            name={n}
            color={icons[value]?.color || theme.colors.midGray}
            size={icons[value]?.size || 20}
            style={[{ width: 22 }, icons[value]?.style]}
          />
        );
      });
    }
    return iconArr ? <View style={{flexDirection: 'row'}}>{iconArr}</View> : undefined;
  };

  const renderValue: ListRenderItem<string> = ({ item: value, index }) => {
    return (
      <ListItemCheckbox
        key={`${value}${index}`}
        title={icons && icons[value]?.hideTitle ? '' : value}
        leftImage={getIconEl(value)}
        position={
          mode === 'one-or-none'
            ? index === 0 ? ['first'] : []
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
    )
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        {(mode === 'many-with-actions' || mode === 'many-or-none') &&
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
        }
        <Divider text={sectionName} />
        <FlatList
          data={list.values}
          renderItem={renderValue}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
        {mode === 'one-or-none' &&
          <ListItemCheckbox
            title={'None'}
            position={list.values.length === 0 ? ['first', 'last'] : ['last']}
            checked={!list.selected.length}
            onPress={() => toggleSelect()}
          />
        }
        {mode === 'many-or-none' &&
          <>
            <Divider />
            <ListItemCheckbox
              title={'Unspecified'}
              position={['first', 'last']}
              checked={list.selected[0] === 'Unspecified'}
              onPress={selectUnspecified}
            />
          </>
        }
        <Divider type={'note'} text={footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default EnumPickerScreen;
