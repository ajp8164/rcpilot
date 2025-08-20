import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  Text,
  TextStyle,
  View,
} from 'react-native';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  ListItemInputMethods,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { ListItemInput } from 'components/atoms/List';
import { precisionFromMask } from 'lib/inputMasks';
import lodash from 'lodash';
import {
  BatteriesNavigatorParamList,
  NewBatteryCycleNavigatorParamList,
} from 'types/navigation';

export type BatteryCellValuesEditorConfig = {
  name: string;
  namePlural: string;
  units: string;
  mask: string;
  headerButtonStyle?: TextStyle;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any; // Caller data that is simply passed through the editor.
};

export type BatteryCellValuesEditorResult = {
  cellValues: number[];
  packValue: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any;
};

export type Props = CompositeScreenProps<
  NativeStackScreenProps<
    BatteriesNavigatorParamList,
    'BatteryCellValuesEditor'
  >,
  NativeStackScreenProps<NewBatteryCycleNavigatorParamList>
>;

const BatteryCellValuesEditorScreen = ({ navigation, route }: Props) => {
  const {
    config,
    eventName,
    packValue: _packValue,
    cellValues: _cellValues,
    pCells: _pCells,
    sCells,
  } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();

  const precision = precisionFromMask(config.mask);
  const [packValue, setPackValue] = useState(_packValue.toFixed(precision));
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const [cellValues, setCellValues] = useState(
    _cellValues.map(v => {
      return v.toString();
    }),
  );

  const initializing = useRef(true);
  const liRef = useRef<ListItemInputMethods[]>([]);

  useEffect(() => {
    const canSubmit = !lodash.isEqual(
      _cellValues.map(v => {
        return v.toString();
      }),
      cellValues.map(v => {
        return v.toString();
      }),
    );

    const cancel = () => {
      Keyboard.dismiss();
      navigation.goBack();
    };

    const save = () => {
      event.emit(eventName, {
        cellValues: cellValues.map(v => {
          return v.length > 0 ? parseFloat(v) : 0;
        }),
        packValue: parseFloat(packValue),
        extraData: config.extraData,
      } as BatteryCellValuesEditorResult);

      Keyboard.dismiss();
      navigation.goBack();
    };

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              ...config.headerButtonStyle,
            }}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={cancel}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            title={'Save'}
            titleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              ...config.headerButtonStyle,
            }}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledTitleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              ...config.headerButtonStyle,
            }}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={!canSubmit}
            onPress={save}
          />
        );
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellValues, packValue]);

  useEffect(() => {
    if (initializing.current) {
      initializing.current = false;
      return;
    }

    // Compute new total pack value.
    const newPackValue = cellValues.reduce((previousValue, currentValue) => {
      const pv = previousValue || '0';
      const cv = currentValue || '0';
      return (parseFloat(pv) + parseFloat(cv)).toFixed(precision);
    });
    setPackValue(newPackValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellValues]);

  const autoFill = (index: number, value: string) => {
    // Convenience auto-fill.
    // When entering into the first value, if the rest of the values are zero then fill.
    const r = ([] as string[]).concat(cellValues);
    if (index === 0) {
      const notFilled = r.slice(1).every(v => {
        return parseFloat(v) === 0;
      });
      if (notFilled) {
        r.fill(value);
      }
    } else {
      r[index] = value;
    }
    setCellValues(r);
  };

  const renderHeader = () => {
    const packHasValue = parseFloat(packValue) > 0;
    return (
      <>
        <Divider text={`OVERALL PACK ${config.name.toUpperCase()}`} />
        <ListItem
          title={'Total Pack'}
          value={
            <View style={s.valueContainer}>
              <Text style={packHasValue ? s.value : s.valuePlaceholder}>
                {packHasValue ? packValue : 'Unknown'}
              </Text>
              <Text style={s.units}>{` ${config.units}`}</Text>
            </View>
          }
          position={['first', 'last']}
        />
        <Divider text={`PER-CELL ${config.namePlural.toUpperCase()}`} />
      </>
    );
  };

  const renderValue: ListRenderItem<string> = ({ item: value, index }) => {
    const s = (index % sCells) + 1;
    const p = Math.trunc(index / sCells) + 1;
    return (
      <ListItemInput
        ref={ref => {
          ref && (liRef.current[index] = ref);
        }}
        title={`S Cell ${s} in P Leg ${p}`}
        position={listItemPosition(index, cellValues.length)}
        units={config.units}
        container={'right'}
        inputProps={{
          inputAccessoryViewID: 'keyboardAccessory',
          value: parseFloat(value) === 0 ? '' : value,
          onChangeText: (_, unformatted) => {
            // Cause a re-render to update total pack value.
            setCellValues(prevState => {
              const r = ([] as string[]).concat(prevState);
              r[index] = unformatted || '0';
              return r;
            });
          },
          onBlur: () => {
            autoFill(index, cellValues[index]);
          },
          mask: config.mask,
          rtlNumber: true,
          placeholder: 'Value',
          keyboardType: 'decimal-pad',
        }}
      />
    );
  };

  return (
    <View style={theme.styles.view}>
      <FlatList
        data={cellValues}
        renderItem={renderValue}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={<Divider style={s.divider} />}
      />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  divider: {
    marginBottom: 15,
  },
  valueContainer: {
    flexDirection: 'row',
  },
  value: {
    ...theme.text.normal,
  },
  valuePlaceholder: {
    ...theme.text.normal,
    ...theme.styles.textPlaceholder,
  },
  units: {
    ...theme.text.normal,
    color: theme.colors.listItemValue,
  },
}));

export default BatteryCellValuesEditorScreen;
