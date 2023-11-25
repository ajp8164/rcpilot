import React, { useEffect, useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckbox } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewModelNavigatorParamList } from 'types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isArray } from 'lodash';
import { useSetState } from '@react-native-ajp-elements/core';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<NewModelNavigatorParamList, 'ValuePicker'>;

const ValuePickerScreen = ({ route, navigation }: Props) => {
  const { title, kind, values: inputObject, selected } = route.params;

  const theme = useTheme();

  const [list, setList] = useSetState({
    values: [] as string[],
    selected: '',
  });

  useEffect(() => {
    navigation.setOptions({
      title,
    });

    // The input may be an array of strings or a simple key-value object where the key
    // is a unique id. When the input is an object the input 'selected' param is expected to be
    // a key value (a unique id). The list.selected is always the actual value, never the unqiue id.
    if (isArray(inputObject)) {
      setList({
        values: inputObject,
        selected: selected,
      });
    } else { 
      setList({
        values: Object.values(inputObject),
        selected: inputObject[selected],
      });
    }
  }, []);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {list.values.map((name, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={name}
            position={list.values.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === list.values.length - 1 ? ['last'] : []}
            checked={name === list.selected}
            onPress={() => null}
          />)
      })}
      {kind &&
        <Divider type={'note'} text={`You can manage ${kind} through the Globals section in the Setup tab.`} />
      }
    </SafeAreaView>
  );
};

export default ValuePickerScreen;
